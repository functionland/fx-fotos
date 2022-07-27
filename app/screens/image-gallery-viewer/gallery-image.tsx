import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import React, { MutableRefObject, useRef } from "react"
import { useMemo } from "react"
import { View } from "react-native"
import { useWindowDimensions, StyleSheet } from "react-native"
import {
  FlatList,
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { SharedElement } from "react-navigation-shared-element"
import { Text } from "../../components"
import { palette } from "../../theme"
import { Asset } from "../../types"

type GalleryImageProps = {
  asset: Asset
  listRef: MutableRefObject<FlatList>
  listGestureRef: MutableRefObject<NativeViewGestureHandler>
}

const MAX_SCALE = 6
const SWIPE_UP_THRESHOLD = 10

export const GalleryImage: React.FC<GalleryImageProps> = ({ asset, listRef, listGestureRef }) => {
  const navigation = useNavigation()
  const dims = useWindowDimensions()
  const accumulatedScale = useSharedValue(1)
  const curScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const accumulatedX = useSharedValue(0)
  const accumulatedY = useSharedValue(0)
  const bottomSheetOpacity = useSharedValue(0)
  const isImageInfoSheetOpened = useSharedValue(false)
  const screenOpacity = useSharedValue(1)
  const panHandlerRef = useRef(null)
  const pinchHandlerRef = useRef(null)

  const isZoomed = useDerivedValue(() => {
    if (accumulatedScale.value > 1) {
      return true
    } else {
      return false
    }
  })

  const getXLimit = () => {
    "worklet"
    const imageWidth = dims.width / 2
    const limit = imageWidth * accumulatedScale.value - imageWidth
    return limit
  }

  const getYLimit = () => {
    "worklet"
    const imageHeight = dims.height / 2
    const limit = imageHeight * accumulatedScale.value - imageHeight
    return limit
  }

  const onDoubleTap = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onActive({ absoluteX, absoluteY }) {
      if (isImageInfoSheetOpened.value) {
        return
      }

      if (!isZoomed.value) {
        accumulatedScale.value = withTiming(MAX_SCALE)
        translateX.value = withTiming((dims.width / 2 - absoluteX) * MAX_SCALE)
        translateY.value = withTiming((dims.height / 2 - absoluteY) * MAX_SCALE)
      } else {
        accumulatedScale.value = withTiming(1)
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
      }
    },
    onFinish() {
      curScale.value = accumulatedScale.value
      accumulatedX.value = translateX.value
      accumulatedY.value = translateY.value
    },
  })

  const disableParentListScroll = () => {
    listRef.current.setNativeProps({ scrollEnabled: false })
  }

  const enableParentListScroll = () => {
    listRef.current.setNativeProps({ scrollEnabled: true })
  }

  const onPan = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive(event) {
      if (isZoomed.value) {
        // Pan Zoomed Image.
        const newX = accumulatedX.value + event.translationX
        const newY = accumulatedY.value + event.translationY
        const xLimit = getXLimit()
        const yLimit = getYLimit()
        if (newX < xLimit && newX > -xLimit) {
          translateX.value = newX
        }
        if (newY < yLimit && newY > -yLimit) {
          translateY.value = newY
        }
      } else {
        // Handle interaction when image is zoomed out.
        const { translationX, translationY } = event

        // Left / Right Swipe started.
        if (Math.abs(translationX) > 1) {
          return
        }

        // Up Swipe started.
        if (!isImageInfoSheetOpened.value) {
          // Start of Swipe up gesture
          if (translationY < -SWIPE_UP_THRESHOLD) {
            bottomSheetOpacity.value = withTiming(1)
            translateY.value = withTiming(-200)
            runOnJS(disableParentListScroll)()
            isImageInfoSheetOpened.value = true
          }
        }
      }
    },
    onFinish(event, _, isCanceledOrFailed) {
      if (isCanceledOrFailed) {
        return
      }

      if (isZoomed.value) {
        accumulatedX.value = translateX.value
        accumulatedY.value = translateY.value
      } else {
        if (isImageInfoSheetOpened.value) {
          const { translationY } = event
          if (translationY > 0) {
            // End of swipe down gesture
            bottomSheetOpacity.value = withTiming(0)
            translateY.value = withTiming(0)
            runOnJS(enableParentListScroll)()
            isImageInfoSheetOpened.value = false
          }
        }
      }
    },
  })

  const onPinch = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive(event) {
      if (isImageInfoSheetOpened.value) {
        return
      }

      const newScale = curScale.value * event.scale
      if (newScale < 0.6) {
        screenOpacity.value = interpolate(event.scale, [0, 0.6], [0, 1])
      } else {
        screenOpacity.value = withTiming(1)
      }
      if (newScale > 1 && newScale < MAX_SCALE) {
        accumulatedScale.value = newScale
      }
      const xLimit = getXLimit()
      const yLimit = getYLimit()
      if (accumulatedX.value > xLimit) {
        accumulatedX.value = xLimit
        translateX.value = xLimit
      }
      if (accumulatedX.value < -xLimit) {
        accumulatedX.value = -xLimit
        translateX.value = -xLimit
      }

      if (accumulatedY.value > yLimit) {
        accumulatedY.value = yLimit
        translateY.value = yLimit
      }
      if (accumulatedY.value < -yLimit) {
        accumulatedY.value = -yLimit
        translateY.value = -yLimit
      }
    },
    onFinish(event, context, isCanceledOrFailed) {
      if (isImageInfoSheetOpened.value) {
        return
      }
      if (!isCanceledOrFailed) {
        const newScale = curScale.value * event.scale
        if (newScale < 1) {
          if (newScale < 0.6) {
            runOnJS(navigation.goBack)()
          } else {
            accumulatedScale.value = withTiming(1)
            curScale.value = 1
          }
        } else if (newScale > MAX_SCALE) {
          curScale.value = MAX_SCALE
          accumulatedScale.value = withTiming(MAX_SCALE)
        } else {
          curScale.value = accumulatedScale.value
        }

        if (curScale.value > 1) {
          runOnJS(disableParentListScroll)()
        } else {
          runOnJS(enableParentListScroll)()
        }
      }
    },
  })

  const animatedImageContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: accumulatedScale.value,
        },
        {
          translateX: translateX.value / accumulatedScale.value,
        },
        {
          translateY: translateY.value / accumulatedScale.value,
        },
      ],
    }
  })

  const animatedBottomSheetStyle = useAnimatedStyle(() => {
    return {
      height: dims.height,
      opacity: bottomSheetOpacity.value,
    }
  })

  const screenStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
    }
  })

  const imageStyle = useMemo(() => {
    return { width: dims.width, aspectRatio: dims.width / dims.height }
  }, [dims.width, dims.height])

  return (
    <Animated.View style={screenStyle}>
      <TapGestureHandler
        numberOfTaps={2}
        maxDist={10}
        onGestureEvent={onDoubleTap}
        waitFor={[panHandlerRef, pinchHandlerRef]}
      >
        <Animated.View>
          <PinchGestureHandler
            ref={pinchHandlerRef}
            onGestureEvent={onPinch}
            simultaneousHandlers={panHandlerRef}
          >
            <Animated.View>
              <PanGestureHandler
                ref={panHandlerRef}
                onGestureEvent={onPan}
                simultaneousHandlers={[pinchHandlerRef, listGestureRef]}
              >
                <Animated.View style={animatedImageContainerStyle}>
                <SharedElement id={asset?.id}>
                  <Animated.Image
                    source={{ uri: asset.uri }}
                    fadeDuration={0}
                    resizeMode="contain"
                    style={imageStyle}
                  />
                  </SharedElement>
                  <Animated.View style={[styles.bottomSheet, animatedBottomSheetStyle]}>
                    <View style={styles.handle} />
                    <Text style={styles.dateText}>
                      {moment(asset.modificationTime).format("ddd, Do MMM YYYY . h:mm")}
                    </Text>
                    <Text style={styles.heading}>Details</Text>
                    <View style={styles.detailsContainer}>
                      <Text style={styles.locationHeading}>Location:</Text>
                      <Text style={styles.uri}>{asset.uri}</Text>
                    </View>
                    <View style={styles.dimensionInfoContainer}>
                      <Text style={styles.dimensionHeading}>Dimensions:</Text>
                      <Text style={styles.dimensionText}>
                        {asset.width} X {asset.height}
                      </Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    top: "75%",
    left: 0,
    right: 0,
    backgroundColor: palette.white,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    padding: 20,
    elevation: 5,
  },
  handle: {
    width: 30,
    borderRadius: 2,
    height: 4,
    opacity: 0.25,
    backgroundColor: palette.black,
    alignSelf: "center",
    position: "absolute",
    top: 10,
  },
  dateText: {
    color: palette.black,
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 8,
  },
  heading: { color: palette.black, fontWeight: "bold", marginBottom: 8 },
  detailsContainer: { flexDirection: "row", marginBottom: 8 },
  locationHeading: { color: palette.black, fontWeight: "bold" },
  uri: { marginLeft: 10, color: palette.black, flex: 1 },
  dimensionInfoContainer: { flexDirection: "row" },
  dimensionHeading: { color: palette.black, fontWeight: "bold" },
  dimensionText: { marginLeft: 10, color: palette.black }
})
