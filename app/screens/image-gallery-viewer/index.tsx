import { NavigationProp, RouteProp } from '@react-navigation/native'
import { BottomSheet, Button, Card, Icon, Input } from '@rneui/themed'
import {
  DataProvider,
  GridLayoutProvider,
  RecyclerListView,
} from 'fula-recyclerlistview'
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Share,
  TouchableOpacity,
  useWindowDimensions,
  View,
  InteractionManager,
  StyleSheet,
} from 'react-native'
import { NativeViewGestureHandler } from 'react-native-gesture-handler'
import { useRecoilState } from 'recoil'
import Toast from 'react-native-toast-message'
import { useNetInfo } from '@react-native-community/netinfo'
import { TaggedEncryption } from '@functionland/fula-sec'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Header, Text } from '../../components'
import {
  HeaderArrowBack,
  HeaderLeftContainer,
  HeaderRightContainer,
} from '../../components/header'
import { RootStackParamList } from '../../navigators'
import { Assets } from '../../services/localdb'
import { singleAssetState, recyclerSectionsState } from '../../store'
import { Asset, SyncStatus, ViewType } from '../../types'
import { GalleryImage } from './gallery-image'
import {
  AddBoxs,
  downloadAndDecryptAsset,
  downloadAsset,
  uploadAssetsInBackground,
} from '../../services/sync-service'
import * as helper from '../../utils/helper'
import { palette } from '../../theme'

interface ImageGalleryViewerScreenProps {
  navigation: NavigationProp<RootStackParamList>
  route: RouteProp<RootStackParamList, 'ImageGalleryViewer'>
}

export const ImageGalleryViewerScreen: React.FC<
  ImageGalleryViewerScreenProps
> = ({ route, navigation }) => {
  const [asset, setAsset] = useRecoilState(singleAssetState)
  const [recyclerList] = useRecoilState(recyclerSectionsState)
  const { assetId, scrollToItem } = route.params
  const windowDims = useWindowDimensions()
  const initialIndexRef = useRef(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showShareBottomSheet, setShowShareBottomSheet] = useState(false)
  const [DID, setDID] = useState('')
  const [sharing, setSharing] = useState(false)
  const netInfoState = useNetInfo()
  const screenOpacity = useSharedValue(1)
  const currentAssetRef = useRef(asset)
  const [transitionDone, setTransitionDone] = useState(false)
  const optionsVisibleRef = useRef(true)
  const headerOffset = useSharedValue(0)
  const footerOffset = useSharedValue(0)

  const headerHeightRef = useRef(0)
  const footerHeightRef = useRef(0)

  if (initialIndexRef.current === null) {
    recyclerList
      .filter(section => section.type === ViewType.ASSET)
      .forEach((section, idx) => {
        if (section.data.id === assetId) {
          initialIndexRef.current = idx
        }
      })
  }
  const listGestureRef = useRef()
  const rclRef = useRef()

  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() =>
      setTimeout(() => {
        setTransitionDone(true)
        rclRef.current?.forceRerender()
      }, 0),
    )

    return () => {
      interactionPromise.cancel()
    }
  }, [])

  const enableScroll = useCallback(() => {
    setScrollEnabled(true)
  }, [])

  const disableScroll = useCallback(() => {
    setScrollEnabled(false)
  }, [])

  const toggleMenu = useCallback(() => {
    if (optionsVisibleRef.current) {
      headerOffset.value = withTiming(-headerHeightRef.current)
      footerOffset.value = withTiming(-footerHeightRef.current)
    } else {
      headerOffset.value = withTiming(0)
      footerOffset.value = withTiming(0)
    }
    optionsVisibleRef.current = !optionsVisibleRef.current
  }, [])

  const renderItem = useCallback(
    ({ item }) => (
      <GalleryImage
        asset={item}
        toggleMenu={toggleMenu}
        sharedElementId={transitionDone ? item.id : `${item.id}_`}
        enableParentScroll={enableScroll}
        disableParentScroll={disableScroll}
        listGestureRef={listGestureRef}
        screenOpacity={screenOpacity}
      />
    ),
    [enableScroll, disableScroll, screenOpacity, transitionDone, toggleMenu],
  )

  const rowRenderer = useCallback(
    (type: string | number, data: Asset) => {
      if (!data) return null
      if (data?.syncStatus === SyncStatus.SYNCED && data?.isDeleted) {
        return renderDownloadSection()
      }
      if (data.isDeleted) {
        return null
      }
      return renderItem({ item: data })
    },
    [transitionDone],
  )

  const layoutProvider = useMemo(
    () =>
      new GridLayoutProvider(
        1,
        () => 'PHOTO',
        () => 1,
        () => windowDims.width,
      ),
    [windowDims],
  )

  const dataProvider = useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1?.id !== r2?.id)
    provider = provider.cloneWithRows(
      recyclerList
        .filter(section => section.type === ViewType.ASSET)
        .map(section => section.data),
      0,
    )
    return provider
  }, [recyclerList])

  const goBack = useCallback(() => {
    navigation.setParams({
      assetId: currentAssetRef.current.id,
    })
    setTimeout(() => {
      navigation.goBack()
    })
  }, [])

  const cancelUpdate = useCallback(() => {
    Alert.alert('Waiting for connection', 'Will upload when connected', [
      {
        text: 'Cancel update',
        onPress: async () => {
          console.log('onPressed ', asset)
          await Assets.addOrUpdate([
            {
              id: asset.id,
              syncStatus: SyncStatus.NOTSYNCED,
            },
          ])
          setAsset(prev => ({
            ...prev,
            syncStatus: SyncStatus.NOTSYNCED,
          }))
        },
      },
      {
        text: 'OK',
      },
    ])
  }, [asset])

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
          setAsset(prev => ({
            ...prev,
            syncStatus: SyncStatus.SYNC,
          }))
          if (!netInfoState.isConnected) {
            Toast.show({
              type: 'info',
              text1: 'Will upload when connected',
              position: 'bottom',
              bottomOffset: 0,
            })
            return
          }
          try {
            await AddBoxs()
          } catch (error) {
            Alert.alert('Warning', error)
            return
          }
          try {
            Toast.show({
              type: 'info',
              text1: 'Upload...',
              position: 'bottom',
              bottomOffset: 0,
            })
            await uploadAssetsInBackground({
              callback: success => {
                if (success)
                  setAsset(prev => ({
                    ...prev,
                    syncStatus: SyncStatus.SYNCED,
                  }))
                else
                  Toast.show({
                    type: 'error',
                    text1: 'Will upload when connected',
                    position: 'bottom',
                    bottomOffset: 0,
                  })
              },
            })
          } catch (error) {
            Alert.alert(
              'Error',
              'Unable to send the file now, will upload when connected',
            )
          }
        } catch (error) {
          console.log('uploadOrDownload', error)
          Alert.alert(
            'Error',
            'Unable to send the file, make sure your box is available!',
          )
        } finally {
          setLoading(false)
        }
      }, 0)
    } else if (asset?.syncStatus === SyncStatus.SYNC) {
      cancelUpdate()
    }
  }

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    top: headerOffset.value,
  }))

  const renderHeader = useCallback(
    () => (
      <Animated.View style={[{ zIndex: 10 }, animatedHeaderStyle]}>
        <Header
          onLayout={event => {
            headerHeightRef.current = event.nativeEvent.layout.height
          }}
          containerStyle={{
            marginTop: 10,
            zIndex: 10,
            backgroundColor: 'transparent',
          }}
          leftComponent={
            <HeaderLeftContainer>
              <HeaderArrowBack
                navigation={navigation}
                iconProps={{
                  onPress: goBack,
                }}
              />
            </HeaderLeftContainer>
          }
          rightComponent={
            <HeaderRightContainer>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : asset?.syncStatus === SyncStatus.SYNCED &&
                !asset?.isDeleted ? (
                <Icon type="material-community" name="cloud-check" />
              ) : asset?.syncStatus === SyncStatus.NOTSYNCED &&
                !asset?.isDeleted ? (
                <Icon
                  type="material-community"
                  name="cloud-upload-outline"
                  onPress={uploadToBox}
                />
              ) : asset?.syncStatus === SyncStatus.SYNC ? (
                <Icon
                  type="material-community"
                  name="refresh"
                  onPress={uploadToBox}
                />
              ) : null}
              {asset?.syncStatus === SyncStatus.SYNCED && (
                <Icon
                  type="material-community"
                  style={styles.headerIcon}
                  name="share-variant"
                  onPress={() => {
                    setDID('')
                    setShowShareBottomSheet(true)
                  }}
                />
              )}
            </HeaderRightContainer>
          }
        />
      </Animated.View>
    ),
    [navigation, loading, uploadToBox, asset, goBack],
  )

  const shareWithDID = async () => {
    if (!DID) return
    setSharing(true)
    try {
      const shareAsset = (await Assets.getById(asset.id))?.[0]
      const myDID = await helper.getMyDID()
      if (myDID && shareAsset) {
        const myTag = new TaggedEncryption(myDID.did)
        const symetricKey = (
          await helper.decryptJWE(myDID.did, JSON.parse(shareAsset?.jwe))
        )?.symetricKey
        const jwe = await myTag.encrypt(symetricKey, symetricKey?.id, [DID])
        Share.share({
          title: 'Fotos | Just shared an asset',
          // eslint-disable-next-line no-undef
          message: `https://fotos.fx.land/shared/${Buffer.from(
            JSON.stringify(jwe),
            'utf-8',
          ).toString('base64')}`,
        })
      }
    } catch (error) {
      Alert.alert('Error', error.toString())
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
            Alert.alert('Warning', error)
            return
          }
          const myDID = await helper.getMyDID()
          let fileRef = null
          if (myDID) {
            const jwe = JSON.parse(asset?.jwe)
            fileRef = (await helper.decryptJWE(myDID.did, jwe))?.symetricKey
          }
          let result = null
          if (fileRef) {
            result = await downloadAndDecryptAsset(fileRef)
          } else {
            result = await downloadAsset(asset?.cid)
          }
          if (result) {
            setAsset(prev => ({
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
          console.log('uploadOrDownload', error)
          Alert.alert(
            'Error',
            'Unable to receive the file, make sure your box is available!',
          )
        } finally {
          setLoading(false)
        }
      }, 0)
    }
  }

  const renderDownloadSection = useCallback(
    () => (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Card
          containerStyle={{
            borderWidth: 0,
          }}
        >
          <Icon
            type="material-community"
            name="cloud-download-outline"
            size={78}
            onPress={downloadFromBox}
          />
          <Card.Title>Tap to download</Card.Title>
        </Card>
      </View>
    ),
    [downloadFromBox],
  )

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { x: xOffset } = event.nativeEvent.contentOffset
      const imageWidth = windowDims.width
      const index = Math.round(xOffset / imageWidth)
      currentAssetRef.current = dataProvider.getDataForIndex(index)
      setTimeout(() => {
        recyclerList.forEach(section => {
          if (section.id === currentAssetRef.current.id) {
            scrollToItem(section, false)
          }
        })
      })
    },
    [windowDims.width],
  )

  const onActionPress = useCallback((action: string) => {
    alert(`Action ${action} is being developed`)
  }, [])

  const animatedFooterStyle = useAnimatedStyle(() => ({
    bottom: footerOffset.value,
  }))

  const renderActionButtons = useCallback(
    () => (
      <Animated.View
        onLayout={event => {
          footerHeightRef.current = event.nativeEvent.layout.height
        }}
        style={[styles.actionButtonContainer, animatedFooterStyle]}
      >
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onActionPress('delete')}
        >
          <Icon
            name="delete"
            type="material-community"
            size={30}
            color={palette.white}
          />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onActionPress('print')}
        >
          <Icon
            name="printer"
            type="material-community"
            size={30}
            color={palette.white}
          />
          <Text style={styles.actionText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onActionPress('upload')}
        >
          <Icon
            name="cloud-upload-outline"
            type="material-community"
            size={30}
            color={palette.white}
          />
          <Text style={styles.actionText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onActionPress('AddToAlbum')}
        >
          <Icon
            name="playlist-plus"
            type="material-community"
            size={30}
            color={palette.white}
          />
          <Text style={styles.actionText}>Add to Album</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onActionPress('openWith')}
        >
          <Icon
            name="open-in-app"
            type="material-community"
            size={30}
            color={palette.white}
          />
          <Text style={styles.actionText}>Open With</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onActionPress('help')}
        >
          <Icon
            name="help-circle-outline"
            type="material-community"
            size={30}
            color={palette.white}
          />
          <Text style={styles.actionText}>Help</Text>
        </TouchableOpacity>
      </Animated.View>
    ),
    [],
  )

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
    opacity: screenOpacity.value,
  }))

  return (
    <Animated.View style={wrapperAnimatedStyle}>
      <View style={{ flex: 1 }}>
        {renderHeader()}
        <NativeViewGestureHandler ref={listGestureRef}>
          <RecyclerListView
            ref={rclRef}
            isHorizontal
            initialRenderIndex={initialIndexRef.current}
            style={{ flex: 1 }}
            layoutProvider={layoutProvider}
            dataProvider={dataProvider}
            rowRenderer={rowRenderer}
            renderAheadOffset={5}
            scrollViewProps={{
              scrollEnabled,
              pagingEnabled: true,
              onMomentumScrollEnd,
              showsHorizontalScrollIndicator: false,
              showsVerticalScrollIndicator: false,
            }}
          />
        </NativeViewGestureHandler>
        {transitionDone || (
          <View style={styles.mockContainer}>
            <GalleryImage
              asset={asset}
              sharedElementId={asset.id}
              enableParentScroll={enableScroll}
              disableParentScroll={disableScroll}
              listGestureRef={listGestureRef}
              screenOpacity={screenOpacity}
            />
          </View>
        )}
        {renderActionButtons()}
        <BottomSheet
          isVisible={showShareBottomSheet}
          onBackdropPress={() => setShowShareBottomSheet(false)}
          modalProps={{
            transparent: true,
            animationType: 'fade',
          }}
          containerStyle={styles.bottomSheetContainer}
        >
          <Card
            containerStyle={{
              borderWidth: 0,
              margin: 0,
            }}
          >
            <Card.Title>Share with (enter DID)</Card.Title>
            <Input
              onChangeText={txt => setDID(txt)}
              onEndEditing={shareWithDID}
            />
          </Card>
          <Button
            title={
              sharing ? (
                <ActivityIndicator
                  style={styles.activityIndicatorStyle}
                  size="small"
                />
              ) : (
                'Share'
              )
            }
            onPress={shareWithDID}
          />
        </BottomSheet>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    marginHorizontal: 10,
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(189,189,189,.2)',
  },
  activityIndicatorStyle: {
    padding: 5,
  },
  actionText: {
    textAlign: 'center',
    color: palette.white,
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
})
