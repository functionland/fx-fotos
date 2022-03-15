import React from "react"
import Animated, {
  withTiming,
  interpolate,
  Extrapolate,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated"
import { snapPoint } from "react-native-redash"
import { Dimensions, StyleSheet } from "react-native"
import { SharedElement } from "react-navigation-shared-element"
import {
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import { widthPercentageToDP } from "react-native-responsive-screen"
import { RouteProp, NavigationProp } from "@react-navigation/native"

import { palette } from "../../theme/palette"
import { Asset } from "../../types"
import { HomeNavigationParamList } from "../../navigators/HomeNavigation"
import { PhotoScreenHeader } from "../../components"

const { height } = Dimensions.get("window")

interface PhotoScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<{ params: { section: Asset } }>
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({ navigation, route }) => {
  const img = route.params.section.data as Asset;

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const imageScale = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)
  const animatedOpacity = useSharedValue(1)
  
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
  const onPanGesture = useAnimatedGestureHandler({
    onStart: () => {
      if (isPanGestureActive.value) return
      isPanGestureActive.value = true
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX
      translateY.value = translationY
      animatedOpacity.value = interpolate(translationY, [0, 400], [1, 0.5], Extrapolate.CLAMP)
    },
    onEnd: ({ velocityY }) => {
      const shouldGoBack = snapPoint(translateY.value, velocityY, [0, height]) === height
      if (shouldGoBack) {
        runOnJS(goBack)();
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
      if (scale > 0.5) {
        imageScale.value = withTiming(1, { duration: 100 })
        animatedOpacity.value = withTiming(1, { duration: 100 })
      }
    },
  })
  const imageContainerStyle= {
    height: (widthPercentageToDP(100) * img.height)/img.width,
    width: widthPercentageToDP(100),
  }
  return (
    <PanGestureHandler maxPointers={1} minPointers={1} onGestureEvent={onPanGesture}>
      <Animated.View style={wrapperAnimatedStyle}>
        <PhotoScreenHeader goBack={() => goBack()} />
        <Animated.View style={animatedStyle}>
          <SharedElement style={imageContainerStyle} id={img.uri}>
            <PinchGestureHandler onGestureEvent={onPinchHandler}>
              <Animated.Image source={{ uri: img.uri }} fadeDuration={0} resizeMode="contain" style={[styles.image, animatedImage]} />
            </PinchGestureHandler>
          </SharedElement>
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
