import React, { useEffect, useState } from "react"
import Animated, {
  runOnJS,
  withTiming,
  interpolate,
  Extrapolate,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from "react-native-reanimated"
import Toast from 'react-native-toast-message'
import { snapPoint } from "react-native-redash"
import { ActivityIndicator, Alert, Dimensions, Share, StyleSheet, View } from "react-native"
import { SharedElement } from "react-navigation-shared-element"
import {
  TapGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import { widthPercentageToDP } from "react-native-responsive-screen"
import { useNetInfo } from "@react-native-community/netinfo"
import { RouteProp, NavigationProp } from "@react-navigation/native"
import { FulaDID } from "@functionland/fula-sec"
import * as Keychain from 'react-native-keychain';

import { Asset, SyncStatus } from "../../types"
import { Constants, palette } from "../../theme"
import { Header } from "../../components"
import { HomeNavigationParamList } from "../../navigators"
import { BottomSheet, Button, Card, Icon, Input } from "@rneui/themed"
import { HeaderArrowBack, HeaderRightContainer } from "../../components/header"
import { useRecoilState } from "recoil"
import { boxsState } from "../../store"
import { Assets } from "../../services/localdb"
import { AddBoxs, downloadAndDecryptAsset, downloadAsset, uploadAssetsInBackground } from "../../services/sync-service"
import { Buffer } from "buffer"
import { TaggedEncryption } from "@functionland/fula-sec"

const { height } = Dimensions.get("window")

interface PhotoScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<{ params: { section: Asset } }>
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({ navigation, route }) => {
  const [asset, setAsset] = useState(JSON.parse(JSON.stringify(route.params.section?.data)) as Asset)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const imageScale = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)
  const animatedOpacity = useSharedValue(1)
  const [, setBoxs] = useRecoilState(boxsState)
  const [loading, setLoading] = useState(false)
  const [showShareBottomSheet, setShowShareBottomSheet] = useState(false);
  const [DID, setDID] = useState("")
  const netInfoState = useNetInfo()
  useEffect(() => {
    return () => {
      Toast.hide();
    }
  })
  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      paddingTop: Constants.HeaderHeight,
      backgroundColor: palette.black,
      flex: 1,
      opacity: animatedOpacity.value,
    }
  })

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(translateY.value, [0, height], [1, 0.5], Extrapolate.CLAMP)
    return {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
    }
  })
  const goBack = () => {
    navigation.goBack()
  }
  const downloadFromBox = async () => {
    if (asset?.syncStatus === SyncStatus.SYNCED && asset?.isDeleted) {
      setLoading(true);
      setTimeout(async () => {
        try {
          try {
            await AddBoxs()
          } catch (error) {
            Alert.alert("Warning", error)
            return;
          }
          let result = null;
          if (asset.fileRef) {
            result = await downloadAndDecryptAsset(asset?.fileRef)
          } else {
            result = await downloadAsset(asset?.cid)
          }
          if (result) {
            setAsset(prev => ({
              ...prev,
              uri: result.uri,
              isDeleted: false
            }))
            Assets.addOrUpdate([{
              id: asset.id,
              uri: result.uri,
              isDeleted: false
            }]);
          }
        } catch (error) {
          console.log("uploadOrDownload", error)
          Alert.alert("Error", "Unable to receive the file, make sure your box is available!")
        } finally {
          setLoading(false)
        }
      }, 0);
    }
  }
  const uploadToBox = async () => {
    if (asset?.syncStatus === SyncStatus.NOTSYNCED && !asset?.isDeleted) {
      setLoading(true);
      setTimeout(async () => {
        try {
          // const _filePath = asset.uri?.split('file:')[1];
          // const result = await file.send(decodeURI(_filePath))
          // console.log("result:",result)
          await Assets.addOrUpdate([{
            id: asset.id,
            syncStatus: SyncStatus.SYNC,
          }]);
          setAsset(prev => ({
            ...prev,
            syncStatus: SyncStatus.SYNC,
          }))
          if (!netInfoState.isConnected) {
            Toast.show({
              type: 'info',
              text1: 'Will upload when connected',
              position: "bottom",
              bottomOffset: 0,
            });
            return
          }
          try {
            await AddBoxs()
          } catch (error) {
            Alert.alert("Warning", error)
            return;
          }
          try {
            Toast.show({
              type: 'info',
              text1: 'Upload...',
              position: "bottom",
              bottomOffset: 0,
            });
            await uploadAssetsInBackground({
              callback: (success) => {
                if (success)
                  setAsset(prev => ({
                    ...prev,
                    syncStatus: SyncStatus.SYNCED,
                  }))
                else
                  Toast.show({
                    type: 'error',
                    text1: 'Will upload when connected',
                    position: "bottom",
                    bottomOffset: 0,
                  });

              }
            });

          } catch (error) {
            Alert.alert("Error", "Unable to send the file now, will upload when connected")
          }
        } catch (error) {
          console.log("uploadOrDownload", error)
          Alert.alert("Error", "Unable to send the file, make sure your box is available!")
        } finally {
          setLoading(false)
        }
      }, 0);
    } else if (asset?.syncStatus === SyncStatus.SYNC) {
      cancelUpdate();
    }
  }
  const cancelUpdate = () => {
    Alert.alert("Waiting for connection", "Will upload when connected", [{
      text: "Cancel update",
      onPress: async () => {
        await Assets.addOrUpdate([{
          id: asset.id,
          syncStatus: SyncStatus.NOTSYNCED,
        }]);
        setAsset(prev => ({
          ...prev,
          syncStatus: SyncStatus.NOTSYNCED,
        }))
      }
    }, {
      text: "OK"
    }])
  }
  const onPanGesture = useAnimatedGestureHandler({
    onStart: () => {
      isPanGestureActive.value = true
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX
      translateY.value = translationY
      if (!isPinchGestureActive.value) {
        animatedOpacity.value = interpolate(translationY, [0, 400], [1, 0.5], Extrapolate.CLAMP)
      }
    },
    onEnd: ({ velocityY }) => {
      if (isPinchGestureActive.value) {
        return
      }
      const shouldGoBack = snapPoint(translateY.value, velocityY, [0, height]) === height
      if (shouldGoBack) {
        runOnJS(goBack)()
      } else {
        translateX.value = withTiming(0, { duration: 100 })
        translateY.value = withTiming(0, { duration: 100 })
        animatedOpacity.value = interpolate(velocityY, [velocityY, 0], [1, 0.5], Extrapolate.CLAMP)
      }
      isPanGestureActive.value = false
    },
  })

  const animatedImage = useAnimatedStyle(() => {
    return {
      transform: [{ scale: imageScale.value }],
    }
  })

  const onPinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onStart: () => {
      if (imageScale.value === 1) {
        return
      }
      isPinchGestureActive.value = true
    },
    onActive: ({ scale }) => {
      imageScale.value = scale
      animatedOpacity.value = interpolate(imageScale.value, [1, 0.5], [1, 0], Extrapolate.CLAMP)
    },
    onEnd: ({ scale }) => {
      if (scale > 1) {
        imageScale.value = scale
        return
      }
      if (scale > 0.6) {
        imageScale.value = withTiming(1, { duration: 100 })
        animatedOpacity.value = withTiming(1, { duration: 100 })
      }
      imageScale.value = scale
    },
    onFinish: ({ scale }) => {
      if (scale < 0.7) {
        runOnJS(goBack)()
      }
    },
  })

  const onDoubleTap = () => {
    if (imageScale.value === 1) {
      imageScale.value = withTiming(1.5, { duration: 150 })
    } else {
      imageScale.value = withTiming(1, { duration: 150 })
    }
  }
  // This method is just for demo
  const shareAsset = async () => {
    try {
      setShowShareBottomSheet(true);
      // await Share.share({
      //   title: 'Fotos | Just shared an asset',
      //   message: `https://fotos.fx.land/shared/${Buffer.from(asset.uri, 'utf-8').toString('base64')}`
      // });

    } catch (error) {
      console.log(error)
    }
  }
  const shareWithDID = async () => {
    if (!DID)
      return
    setShowShareBottomSheet(false)
    try {
      const gPassword = await Keychain.getGenericPassword();
      if (gPassword) {
        const myDID = new FulaDID();
        await myDID.create(gPassword.password, gPassword.password);
        const myTag = new TaggedEncryption(myDID.did);
        const jwe = await myTag.encrypt(asset?.fileRef, asset?.fileRef?.id, [DID])
        await Share.share({
          title: 'Fotos | Just shared an asset',
          message: `https://fotos.fx.land/shared/${Buffer.from(JSON.stringify(jwe), 'utf-8').toString('base64')}`
        });
      }
    } catch (error) {
      console.log(error)
    }
  }
  const imageContainerStyle = {
    height: (widthPercentageToDP(100) * asset.height) / asset.width,
    width: widthPercentageToDP(100),
  }
  const renderHeader = () => {
    return (<Header
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={
        <HeaderRightContainer>
          {loading ? <ActivityIndicator size="small" /> :
            (asset?.syncStatus === SyncStatus.SYNCED && !asset?.isDeleted ? <Icon type="material-community" name="cloud-check" />
              : (asset?.syncStatus === SyncStatus.NOTSYNCED && !asset?.isDeleted ? <Icon type="material-community" name="cloud-upload-outline" onPress={uploadToBox} />
                : asset?.syncStatus === SyncStatus.SYNC ? <Icon type="material-community" name="refresh" onPress={uploadToBox} /> : null))}
          <Icon type="material-community" style={styles.headerIcon} name="share-variant" onPress={shareAsset} />
        </HeaderRightContainer>
      } />)
  }
  const renderDownloadSection = () => {
    return (<Card containerStyle={{ borderWidth: 0 }} >
      <Icon type="material-community" name="cloud-download-outline" size={78} onPress={downloadFromBox} />
      <Card.Title>Tap to download</Card.Title>
    </Card>)
  }
  return (
    <PanGestureHandler maxPointers={1} minPointers={1} onGestureEvent={onPanGesture}>
      <Animated.View style={wrapperAnimatedStyle}>
        {renderHeader()}
        <Animated.View style={animatedStyle}>
          <TapGestureHandler onActivated={() => onDoubleTap()} numberOfTaps={2}>
            <View>
              {asset?.syncStatus === SyncStatus.SYNCED && asset?.isDeleted && renderDownloadSection()}
              {!asset?.isDeleted && <SharedElement style={imageContainerStyle} id={asset.uri}>
                <PinchGestureHandler onGestureEvent={onPinchHandler}>
                  <Animated.Image
                    source={{ uri: asset.uri }}
                    fadeDuration={0}
                    resizeMode="contain"
                    style={[styles.image, animatedImage]}
                  />
                </PinchGestureHandler>
              </SharedElement>}
              <BottomSheet isVisible={showShareBottomSheet}
                onBackdropPress={() => setShowShareBottomSheet(false)}
                modalProps={{ transparent: true, animationType: "fade" }}

              >
                <Card containerStyle={{ borderWidth: 0, margin: 0 }}>
                  <Card.Title>Share with (enter DID)</Card.Title>
                  <Input onChangeText={(txt) => setDID(txt)} />
                </Card>
                <Button title="Share" onPress={shareWithDID} />
              </BottomSheet>
            </View>
          </TapGestureHandler>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  headerIcon: {
    marginHorizontal: 10
  }
})
