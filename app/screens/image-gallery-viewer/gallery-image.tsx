import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import React, { MutableRefObject, useRef } from "react"
import { View } from "react-native"
import { useWindowDimensions } from "react-native"
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
import { Text } from "../../components"
import { Asset } from "../../types"

type GalleryImageProps = {
  asset: Asset
  listRef: MutableRefObject<FlatList>
  listGestureRef: MutableRefObject<NativeViewGestureHandler>
}

const MAX_SCALE = 6
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

  const xLimit = useDerivedValue(() => {
    const imageWidth = dims.width / 2
    const limit = imageWidth * accumulatedScale.value - imageWidth
    if (accumulatedX.value > limit) {
      accumulatedX.value = limit
      translateX.value = withTiming(limit)
    }
    if (accumulatedX.value < -limit) {
      accumulatedX.value = -limit
      translateX.value = withTiming(-limit)
    }
    return limit
  })

  const yLimit = useDerivedValue(() => {
    const imageHeight = dims.height / 2
    const limit = imageHeight * accumulatedScale.value - imageHeight
    if (accumulatedY.value > limit) {
      accumulatedY.value = limit
      translateY.value = withTiming(limit)
    }
    if (accumulatedY.value < -limit) {
      accumulatedY.value = -limit
      translateY.value = withTiming(-limit)
    }
    return limit
  })

  const onDoubleTap = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onActive() {
      if (!isZoomed.value) {
        accumulatedScale.value = withTiming(MAX_SCALE)
      } else {
        accumulatedScale.value = withTiming(1)
      }
    },
    onFinish() {
      curScale.value = accumulatedScale.value
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
        const newX = accumulatedX.value + event.translationX
        const newY = accumulatedY.value + event.translationY
        if (newX < xLimit.value && newX > -xLimit.value) {
          translateX.value = newX
        }
        if (newY < yLimit.value && newY > -yLimit.value) {
          translateY.value = newY
        }
      } else {
        const { translationX, translationY } = event

        // Left / Right Swipe started.
        if (Math.abs(translationX) > 1) {
          return
        }

        // Up Swipe started.
        if (!isImageInfoSheetOpened.value) {
          // Start of Swipe up gesture
          if (translationY < -5) {
            bottomSheetOpacity.value = withTiming(1)
            translateY.value = withTiming(-200)
            runOnJS(disableParentListScroll)()
            isImageInfoSheetOpened.value = true
          }
        }
      }
    },
    onFinish(event, _, isCanceledOrFailed) {
      if (!isCanceledOrFailed) {
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
      }
    },
  })

  const onPinch = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive(event) {
      if (isImageInfoSheetOpened.value) {
        return
      }

      const newScale = curScale.value * event.scale
      accumulatedScale.value = newScale
      if (newScale < 0.6) {
        screenOpacity.value = interpolate(event.scale, [0, 0.6], [0, 1])
      } else {
        screenOpacity.value = withTiming(1)
      }
      if (newScale > 1 && newScale < MAX_SCALE) {
        // accumulatedScale.value = newScale
        if (translateX.value > xLimit.value) {
          accumulatedX.value = xLimit.value
          translateX.value = xLimit.value
        }
        if (translateX.value < -xLimit.value) {
          accumulatedX.value = -xLimit.value
          translateX.value = -xLimit.value
        }
        if (translateY.value > yLimit.value) {
          accumulatedY.value = yLimit.value
          translateY.value = yLimit.value
        }
        if (translateY.value < -yLimit.value) {
          accumulatedY.value = -yLimit.value
          translateY.value = -yLimit.value
        }
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
          }
          accumulatedScale.value = withTiming(1)
          curScale.value = 1
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

  const animatedImageStyle = useAnimatedStyle(() => {
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

  const bottomSheetStyle = useAnimatedStyle(() => {
    return {
      opacity: bottomSheetOpacity.value,
    }
  })

  const screenStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
    }
  })

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
                <Animated.View style={animatedImageStyle}>
                  <Animated.Image
                    source={{ uri: asset.uri }}
                    fadeDuration={0}
                    resizeMode="contain"
                    style={[{ width: dims.width, aspectRatio: dims.width / dims.height }]}
                  />
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        top: "75%",
                        height: dims.height,
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        borderTopStartRadius: 20,
                        borderTopEndRadius: 20,
                        padding: 20,
                        elevation: 5,
                      },
                      bottomSheetStyle,
                    ]}
                  >
                    <View
                      style={{
                        width: 30,
                        borderRadius: 2,
                        height: 4,
                        opacity: 0.25,
                        backgroundColor: "black",
                        alignSelf: "center",
                        position: "absolute",
                        top: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: "black",
                        fontWeight: "bold",
                        fontSize: 18,
                        marginVertical: 8,
                      }}
                    >
                      {moment(asset.modificationTime).format("ddd, Do MMM YYYY . h:mm")}
                    </Text>
                    <Text style={{ color: "black", fontWeight: "bold", marginBottom: 8 }}>
                      Details
                    </Text>
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                      <Text style={{ color: "black", fontWeight: "bold" }}>Location:</Text>
                      <Text style={{ marginLeft: 10, color: "black", flex: 1 }}>{asset.uri}</Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ color: "black", fontWeight: "bold" }}>Dimensions:</Text>
                      <Text style={{ marginLeft: 10, color: "black" }}>
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
