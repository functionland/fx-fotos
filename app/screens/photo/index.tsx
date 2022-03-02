import React from "react"
import { Image, StyleSheet } from "react-native"
import { SharedElement } from "react-navigation-shared-element"
import { PanGestureHandler } from "react-native-gesture-handler"
import { NavigationProp, RouteProp } from "@react-navigation/native"
import { HomeNavigationTypes } from "../../navigators/HomeNavigation"
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"

import { RecyclerAssetListSectionData } from "../../types"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"

interface PhotoScreenProps {
  navigation: NavigationProp<HomeNavigationTypes>
  route: RouteProp<{ params: { section: RecyclerAssetListSectionData } }>
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({ route, navigation }) => {
  const img: RecyclerAssetListSectionData = route.params.section.data

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }
  })

  const onPanGesture = useAnimatedGestureHandler({
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX
      translateY.value = translationY
    },
    onEnd: ({ velocityX, velocityY }) => {},
  })

  return (
    <PanGestureHandler onGestureEvent={onPanGesture}>
      <Animated.View style={animatedStyle}>
        <SharedElement style={styles.container} id={img.uri}>
          <Image source={{ uri: img.uri }} style={styles.image} />
        </SharedElement>
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
