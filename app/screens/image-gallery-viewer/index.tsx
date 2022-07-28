import { NavigationProp, RouteProp } from "@react-navigation/native"
import { BottomSheet, Button, Card, Icon, Input } from "@rneui/themed"
import { DataProvider, GridLayoutProvider, RecyclerListView } from "fula-recyclerlistview"
import React, { useState, useRef, useMemo, useEffect } from "react"
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Share,
  useWindowDimensions,
  View,
} from "react-native"
import { StyleSheet } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"
import { useRecoilState } from "recoil"
import { Header, Screen } from "../../components"
import { HeaderArrowBack, HeaderRightContainer } from "../../components/header"
import { RootStackParamList } from "../../navigators"
import { Assets } from "../../services/localdb"
import { singleAssetState } from "../../store"
import { Asset, SyncStatus } from "../../types"
import { GalleryImage } from "./gallery-image"
import Toast from "react-native-toast-message"
import { useNetInfo } from "@react-native-community/netinfo"
import {
  AddBoxs,
  downloadAndDecryptAsset,
  downloadAsset,
  uploadAssetsInBackground,
} from "../../services/sync-service"
import * as helper from "../../utils/helper"
import { TaggedEncryption } from "@functionland/fula-sec"
import { AddShareMeta, getAssetMeta } from "../../services/remote-db-service"
import { BSON } from "realm"

interface ImageGalleryViewerScreenProps {
  navigation: NavigationProp<RootStackParamList>
  route: RouteProp<RootStackParamList, "ImageGalleryViewer">
}

export const ImageGalleryViewerScreen: React.FC<ImageGalleryViewerScreenProps> = ({
  route,
  navigation,
}) => {
  const [asset, setAsset] = useRecoilState(singleAssetState)
  const { medias, assetId } = route.params
  const windowDims = useWindowDimensions()
  const initialIndexRef = useRef(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showShareBottomSheet, setShowShareBottomSheet] = useState(false)
  const [DID, setDID] = useState("")
  const [sharing, setSharing] = useState(false)
  const netInfoState = useNetInfo()

  if (initialIndexRef.current === null) {
    medias.forEach((asset, idx) => {
      if (asset.id === assetId) {
        initialIndexRef.current = idx
      }
    })
  }

  const listGestureRef = useRef()

  const renderItem = ({ item }) => {
    return (
      <GalleryImage
        asset={item}
        enableParentScroll={enableScroll}
        disableParentScroll={disableScroll}
        listGestureRef={listGestureRef}
      />
    )
  }

  const rowRenderer = (type: string | number, data: Asset) => {
    if (data?.syncStatus === SyncStatus.SYNCED && data?.isDeleted) {
      return renderDownloadSection()
    }
    if (data.isDeleted) {
      return null
    }
    return renderItem({ item: data })
  }

  const layoutProvider = useMemo(() => {
    return new GridLayoutProvider(
      1,
      () => "PHOTO",
      () => 1,
      () => windowDims.width,
    )
  }, [windowDims])

  const dataProvider = useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1.id !== r2.id)
    provider = provider.cloneWithRows(medias, 0)
    return provider
  }, [])

  const enableScroll = () => {
    setScrollEnabled(true)
  }

  const disableScroll = () => {
    setScrollEnabled(false)
  }

  const renderHeader = () => {
    return (
      <Header
        leftComponent={<HeaderArrowBack navigation={navigation} />}
        rightComponent={
          <HeaderRightContainer>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : asset?.syncStatus === SyncStatus.SYNCED && !asset?.isDeleted ? (
              <Icon type="material-community" name="cloud-check" />
            ) : asset?.syncStatus === SyncStatus.NOTSYNCED && !asset?.isDeleted ? (
              <Icon type="material-community" name="cloud-upload-outline" onPress={uploadToBox} />
            ) : asset?.syncStatus === SyncStatus.SYNC ? (
              <Icon type="material-community" name="refresh" onPress={uploadToBox} />
            ) : null}
            {asset?.syncStatus === SyncStatus.SYNCED && (
              <Icon
                type="material-community"
                style={styles.headerIcon}
                name="share-variant"
                onPress={() => {
                  setDID("")
                  setShowShareBottomSheet(true)
                }}
              />
            )}
          </HeaderRightContainer>
        }
      />
    )
  }

  const uploadToBox = async () => {
    if (asset?.syncStatus === SyncStatus.NOTSYNCED && !asset?.isDeleted) {
      setLoading(true)
      setTimeout(async () => {
        try {
          // const _filePath = asset.uri?.split('file:')[1];
          // const result = await file.send(decodeURI(_filePath))
          // console.log("result:",result)
          await Assets.addOrUpdate([
            {
              id: asset.id,
              syncStatus: SyncStatus.SYNC,
            },
          ])
          setAsset((prev) => ({
            ...prev,
            syncStatus: SyncStatus.SYNC,
          }))
          if (!netInfoState.isConnected) {
            Toast.show({
              type: "info",
              text1: "Will upload when connected",
              position: "bottom",
              bottomOffset: 0,
            })
            return
          }
          try {
            await AddBoxs()
          } catch (error) {
            Alert.alert("Warning", error)
            return
          }
          try {
            Toast.show({
              type: "info",
              text1: "Upload...",
              position: "bottom",
              bottomOffset: 0,
            })
            await uploadAssetsInBackground({
              callback: (success) => {
                if (success)
                setAsset((prev) => ({
                  ...prev,
                  syncStatus: SyncStatus.SYNC,
                }))
                else
                  Toast.show({
                    type: "error",
                    text1: "Will upload when connected",
                    position: "bottom",
                    bottomOffset: 0,
                  })
              },
            })
          } catch (error) {
            Alert.alert("Error", "Unable to send the file now, will upload when connected")
          }
        } catch (error) {
          console.log("uploadOrDownload", error)
          Alert.alert("Error", "Unable to send the file, make sure your box is available!")
        } finally {
          setLoading(false)
        }
      }, 0)
    } else if (asset?.syncStatus === SyncStatus.SYNC) {
      cancelUpdate()
    }
  }
  const cancelUpdate = () => {
    Alert.alert("Waiting for connection", "Will upload when connected", [
      {
        text: "Cancel update",
        onPress: async () => {
          console.log("onPressed ", asset)
          await Assets.addOrUpdate([
            {
              id: asset.id,
              syncStatus: SyncStatus.NOTSYNCED,
            },
          ])
          setAsset((prev) => ({
            ...prev,
            syncStatus: SyncStatus.NOTSYNCED,
          }))
        },
      },
      {
        text: "OK",
      },
    ])
  }

  const shareWithDID = async () => {
    if (!DID) return
    setSharing(true)
    try {
      const shareAsset = (await Assets.getById(asset.id))?.[0]
      const myDID = await helper.getMyDID()
      if (myDID && shareAsset) {
        const myTag = new TaggedEncryption(myDID.did)
        const symetricKey = (await helper.decryptJWE(myDID.did, JSON.parse(shareAsset?.jwe)))
          ?.symetricKey
        const jwe = await myTag.encrypt(symetricKey, symetricKey?.id, [DID])
        await AddShareMeta({
          id: new BSON.UUID().toHexString(),
          ownerId: myDID.authDID,
          fileName: asset.filename,
          cid: asset.cid,
          jwe: jwe,
          shareWithId: DID,
          date: new Date().getTime(),
        })
        Alert.alert(
          "Shared",
          "This asset is added to the shared collection on the Box, do you want to create a sharing link too?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => {
                Share.share({
                  title: "Fotos | Just shared an asset",
                  message: `https://fotos.fx.land/shared/${Buffer.from(
                    JSON.stringify(jwe),
                    "utf-8",
                  ).toString("base64")}`,
                })
              },
            },
          ],
        )
      }
    } catch (error) {
      Alert.alert("Error", error.toString())
      console.log(error)
    } finally {
      setSharing(false)
      setShowShareBottomSheet(false)
    }
  }

  const downloadFromBox = async () => {
    if (asset?.syncStatus === SyncStatus.SYNCED && asset?.isDeleted) {
      setLoading(true)
      setTimeout(async () => {
        try {
          try {
            await AddBoxs()
          } catch (error) {
            Alert.alert("Warning", error)
            return
          }
          const myDID = await helper.getMyDID()
          let fileRef = null
          if (myDID) {
            const meta = await getAssetMeta(myDID.authDID, asset.cid)
            fileRef = (await helper.decryptJWE(myDID.did, meta?.jwe))?.symetricKey
          }
          let result = null
          if (fileRef) {
            result = await downloadAndDecryptAsset(fileRef)
          } else {
            result = await downloadAsset(asset?.cid)
          }
          if (result) {
            setAsset((prev) => ({
              ...prev,
              uri: result.uri,
              isDeleted: false,
            }))
            Assets.addOrUpdate([
              {
                id: asset.id,
                uri: result.uri,
                isDeleted: false,
              },
            ])
          }
        } catch (error) {
          console.log("uploadOrDownload", error)
          Alert.alert("Error", "Unable to receive the file, make sure your box is available!")
        } finally {
          setLoading(false)
        }
      }, 0)
    }
  }

  const renderDownloadSection = () => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Card containerStyle={{ borderWidth: 0 }}>
          <Icon
            type="material-community"
            name="cloud-download-outline"
            size={78}
            onPress={downloadFromBox}
          />
          <Card.Title>Tap to download</Card.Title>
        </Card>
      </View>
    )
  }

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x: xOffset } = event.nativeEvent.contentOffset
    const imageWidth = windowDims.width

    const index = Math.floor(xOffset / imageWidth)
    setAsset(medias[index])
  }

  useEffect(() => {
    console.log("asset change ", asset)
  }, [asset])

  return (
    <Screen
      style={styles.screen}
      preset={"fixed"}
      unsafe={true}
      backgroundColor={"black"}
      statusBar={"dark-content"}
    >
      {renderHeader()}
      <NativeViewGestureHandler ref={listGestureRef}>
        <RecyclerListView
          isHorizontal={true}
          initialRenderIndex={initialIndexRef.current}
          style={{ flex: 1 }}
          layoutProvider={layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={rowRenderer}
          renderAheadOffset={5}
          scrollViewProps={{
            scrollEnabled: scrollEnabled,
            pagingEnabled: true,
            onMomentumScrollEnd: onMomentumScrollEnd,
            showsHorizontalScrollIndicator: false,
            showsVerticalScrollIndicator: false,
          }}
        />
      </NativeViewGestureHandler>
      <BottomSheet
        isVisible={showShareBottomSheet}
        onBackdropPress={() => setShowShareBottomSheet(false)}
        modalProps={{ transparent: true, animationType: "fade" }}
        containerStyle={styles.bottomSheetContainer}
      >
        <Card containerStyle={{ borderWidth: 0, margin: 0 }}>
          <Card.Title>Share with (enter DID)</Card.Title>
          <Input onChangeText={(txt) => setDID(txt)} onEndEditing={shareWithDID} />
        </Card>
        <Button
          title={
            sharing ? (
              <ActivityIndicator style={styles.activityIndicatorStyle} size="small" />
            ) : (
              "Share"
            )
          }
          onPress={shareWithDID}
        ></Button>
      </BottomSheet>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    marginHorizontal: 10,
  },
  bottomSheetContainer: {
    backgroundColor: "rgba(189,189,189,.2)",
  },
  activityIndicatorStyle: {
    padding: 5,
  },
})
