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
import { snapPoint } from "react-native-redash"
import { ActivityIndicator, Alert, Dimensions, StyleSheet } from "react-native"
import { SharedElement } from "react-navigation-shared-element"
import {
  TapGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import { widthPercentageToDP } from "react-native-responsive-screen"
import { RouteProp, NavigationProp } from "@react-navigation/native"
import { file, fula } from "react-native-fula"
import { Asset } from "../../types"
import { palette } from "../../theme"
import { Header } from "../../components"
import { HomeNavigationParamList } from "../../navigators"
import { Icon } from "@rneui/themed"
import { HeaderArrowBack } from "../../components/header"
import { useRecoilState } from "recoil"
import { boxsState } from "../../store"
import { Assets, Boxs } from "../../services/localdb"

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

  useEffect(() => {
    loadBoxs();
  }, []);

  const loadBoxs = async () => {
    try {
      const boxs = await Boxs.getAll();
      if (boxs && boxs.length) {
        boxs.map(item => {
          fula.addBox(item.address)
        })
      }
      setBoxs(boxs.map(m => m.toJSON()));
    } catch (error) {
      Alert.alert("Error", "Unable to connect to the box!")
    }

  }

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
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
  const uploadOrDownload = async () => {
    if (!asset?.isSynced && !asset?.isDeleted) {
      setLoading(true);
      setTimeout(async () => {
        try {
          const _filePath = asset.uri?.split('file:')[1];
          const result = await file.send(decodeURI(_filePath))
          Assets.addOrUpdate([{
            id: asset.id,
            cid: result,
            isSynced: true,
            syncDate: new Date(),
          }]);
          setAsset(prev => ({
            ...prev,
            isSynced: true,
            cid: result
          }))
          console.log("CID:", result)

        } catch (error) {
          console.log("uploadOrDownload", error)
          Alert.alert("Error", "Unable to send the file")
        } finally {
          setLoading(false)
        }
      }, 0);
    } else if (asset?.isSynced && asset?.isDeleted) {
      setLoading(true);
      setTimeout(async () => {
        try {
          const result = await file.receive(asset?.cid, false)
          setAsset(prev => ({
            ...prev,
            uri: result.uri,
            isDeleted: false
          }))
        } catch (error) {
          console.log("uploadOrDownload", error)
          Alert.alert("Error", "Unable to receive the file")
        } finally {
          setLoading(false)
        }
      }, 0);
    }
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

  const imageContainerStyle = {
    height: (widthPercentageToDP(100) * asset.height) / asset.width,
    width: widthPercentageToDP(100),
  }
  const renderHeader = () => {
    return (<Header
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={loading ? <ActivityIndicator size="small" /> : <Icon type="material-community"
        name={asset?.isSynced && !asset?.isDeleted ? "cloud-check" : (asset?.isSynced && asset?.isDeleted ? "cloud-download" : "cloud-upload-outline")} onPress={uploadOrDownload} />}
    />)
  }
  return (
    <PanGestureHandler maxPointers={1} minPointers={1} onGestureEvent={onPanGesture}>
      <Animated.View style={wrapperAnimatedStyle}>
        {renderHeader()}
        <Animated.View style={animatedStyle}>
          <TapGestureHandler onActivated={() => onDoubleTap()} numberOfTaps={2}>
            <SharedElement style={imageContainerStyle} id={asset.uri}>
              <PinchGestureHandler onGestureEvent={onPinchHandler}>
                <Animated.Image
                  source={{ uri: asset.uri }}
                  fadeDuration={0}
                  resizeMode="contain"
                  style={[styles.image, animatedImage]}
                />
              </PinchGestureHandler>
            </SharedElement>
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
})
