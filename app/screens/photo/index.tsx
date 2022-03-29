import React from "react"
import Recoil from "recoil"
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
import { Dimensions, StyleSheet } from "react-native"
import { SharedElement } from "react-navigation-shared-element"
import { RouteProp, NavigationProp } from "@react-navigation/native"
import { RecyclerListView, DataProvider, LayoutProvider } from "fula-recyclerlistview"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import { PinchGestureHandler, PinchGestureHandlerGestureEvent } from "react-native-gesture-handler"

import { palette } from "../../theme"
import { mediasState } from "../../store"
import { PhotoScreenHeader } from "../../components"
import { Asset, RecyclerAssetListSection } from "../../types"
import { HomeNavigationParamList } from "../../navigators/home-navigation"

const { height } = Dimensions.get("window")

interface PhotoScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<{ params: { section: Asset } }>
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({ navigation, route }) => {
  const img = route.params.section.data as Asset
  const medias = Recoil.useRecoilValue(mediasState)
  const [initialIndex, setInitialIndex] = React.useState<number>()
  const [headlessMedias, setHeadlessMedias] = React.useState<RecyclerAssetListSection[] | null>(
    null,
  )

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const imageScale = useSharedValue(1)
  const animatedOpacity = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)

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
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
    }
  })
  const goBack = () => {
    navigation.goBack()
  }

  const onPanGesture = useAnimatedGestureHandler({
    onStart: () => {
      if (isPanGestureActive.value) {
        return
      }
      isPanGestureActive.value = true
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX
      translateY.value = translationY
      if (!isPinchGestureActive) {
        animatedOpacity.value = interpolate(translationY, [0, 400], [1, 0.5], Extrapolate.CLAMP)
      }
    },
    onEnd: ({ velocityY }) => {
      if (isPinchGestureActive) {
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
      if (scale > 0.5) {
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

  const imageContainerStyle = {
    height: (widthPercentageToDP(100) * img.height) / img.width,
    width: widthPercentageToDP(100),
  }

  const [dataProvider, setDataProvider] = React.useState<DataProvider>(
    new DataProvider((r1, r2) => {
      return r1.index !== r2.index
    }),
  )

  const layoutProvider = new LayoutProvider(
    () => {
      return 2
    },
    (type, dim) => {
      dim.width = widthPercentageToDP(100)
      dim.height = heightPercentageToDP(100)
    },
  )

  React.useLayoutEffect(() => {
    const mediaWithoutHeaderItems = medias.filter((media) => {
      return media.data.uri
    })
    setHeadlessMedias(mediaWithoutHeaderItems)
  }, [medias])

  React.useLayoutEffect(() => {
    if (!headlessMedias) {
      return
    }
    setDataProvider(dataProvider.cloneWithRows(headlessMedias))
  }, [headlessMedias])

  React.useLayoutEffect(() => {
    if (!headlessMedias) {
      return
    }
    const index = headlessMedias.findIndex((m) => m.data.uri === img.uri)
    setInitialIndex(index)
  }, [])

  return (
    <Animated.View style={wrapperAnimatedStyle}>
      <PhotoScreenHeader goBack={() => goBack()} />
      <RecyclerListView
        initialRenderIndex={initialIndex - 1}
        renderAheadOffset={widthPercentageToDP(100)}
        dataProvider={dataProvider}
        isHorizontal={true}
        layoutProvider={layoutProvider}
        scrollViewProps={{
          disableIntervalMomentum: true,
          disableScrollViewPanResponder: false,
          horizontal: true,
          pagingEnabled: true,
          directionalLockEnabled: true,
          scrollEnabled: true,
        }}
        style={{ height: heightPercentageToDP(100), width: widthPercentageToDP(100) }}
        rowRenderer={(type, data) => {
          return (
            <Animated.View style={animatedStyle}>
              <SharedElement style={imageContainerStyle} id={img.uri}>
                <PinchGestureHandler onGestureEvent={onPinchHandler}>
                  <Animated.Image
                    source={{ uri: data.data.uri }}
                    fadeDuration={0}
                    resizeMode="contain"
                    style={[styles.image, animatedImage]}
                  />
                </PinchGestureHandler>
              </SharedElement>
            </Animated.View>
          )
        }}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
})
