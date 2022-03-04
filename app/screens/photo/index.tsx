import React from "react"
import Animated, {
  withTiming,
  interpolate,
  Extrapolate,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from "react-native-reanimated"
import { snapPoint } from "react-native-redash"
import { Dimensions, Image, StyleSheet } from "react-native"
import { SharedElement } from "react-navigation-shared-element"
import { PanGestureHandler } from "react-native-gesture-handler"
import { widthPercentageToDP } from "react-native-responsive-screen"
import { NavigationProp, RouteProp } from "@react-navigation/native"

import { palette } from "../../theme/palette"
import { RecyclerAssetListSectionData } from "../../types"
import { HomeNavigationTypes } from "../../navigators/HomeNavigation"

const { height } = Dimensions.get("window")

interface PhotoScreenProps {
  navigation: NavigationProp<HomeNavigationTypes>
  route: RouteProp<{ params: { section: RecyclerAssetListSectionData } }>
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({ route }) => {
  const img: RecyclerAssetListSectionData = route.params.section.data

  const isGestureActive = useSharedValue(false)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(translateY.value, [0, height], [1, 0.5], Extrapolate.CLAMP)
    return {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
    }
  })

  const onPanGesture = useAnimatedGestureHandler({
    onStart: () => {
      isGestureActive.value = true
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX
      translateY.value = translationY
    },
    onEnd: ({ velocityY }) => {
      const shouldGoBack = snapPoint(translateY.value, velocityY, [0, height]) === height
      if (shouldGoBack) {
        // TODO: While trying to go back app crashes :/
      } else {
        translateX.value = withTiming(0, { duration: 100 })
        translateY.value = withTiming(0, { duration: 100 })
      }
      isGestureActive.value = false
    },
  })

  const wrapperStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      backgroundColor: palette.white,
      opacity: withTiming(isGestureActive.value ? 0.7 : 1),
    }
  })

  return (
    <PanGestureHandler onGestureEvent={onPanGesture}>
      <Animated.View style={wrapperStyle}>
        <Animated.View style={animatedStyle}>
          <SharedElement style={styles.container} id={img.uri}>
            <Image source={{ uri: img.uri }} style={styles.image} />
          </SharedElement>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  container: {
    height: widthPercentageToDP(100),
    width: widthPercentageToDP(100),
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    height: widthPercentageToDP(100),
    resizeMode: "cover",
    width: widthPercentageToDP(100),
  },
})
