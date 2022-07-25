import moment from "moment"
import React, { MutableRefObject, useRef } from "react"
import { StyleSheet, View } from "react-native"
import { useWindowDimensions } from "react-native"
import {
  FlatList,
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  TapGestureHandler,
} from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
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
  const dims = useWindowDimensions()
  const accumulatedScale = useSharedValue(1)
  const curScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const accumulatedX = useSharedValue(0)
  const accumulatedY = useSharedValue(0)
  const xLimit = useSharedValue(0)
  const yLimit = useSharedValue(0)
  const bottomSheetOffset = useSharedValue(0)
  const isSwipeUpStarted = useSharedValue(false)
  const panHandlerRef = useRef(null)
  const pinchHandlerRef = useRef(null)

  const isZoomed = useDerivedValue(() => {
    if (accumulatedScale.value > 1) {
      return true
    } else {
      return false
    }
  })

  const bottomSheetOpacity = useDerivedValue(() => {
    return Math.abs(bottomSheetOffset.value) > 20 ? 1 : 0
  })

  useAnimatedReaction(
    () => accumulatedScale.value,
    () => {
      const imageWidth = dims.width / 2
      const xlimit = imageWidth * accumulatedScale.value - imageWidth
      if (accumulatedX.value > xlimit) {
        accumulatedX.value = xlimit
        translateX.value = withTiming(xlimit)
      }
      if (accumulatedX.value < -xlimit) {
        accumulatedX.value = -xlimit
        translateX.value = withTiming(-xlimit)
      }
      xLimit.value = xlimit

      const imageHeight = dims.height / 2
      const ylimit = imageHeight * accumulatedScale.value - imageHeight
      if (accumulatedY.value > ylimit) {
        accumulatedY.value = ylimit
        translateY.value = withTiming(ylimit)
      }
      if (accumulatedY.value < -ylimit) {
        accumulatedY.value = -ylimit
        translateY.value = withTiming(-ylimit)
      }
      yLimit.value = ylimit
    },
  )

  const onDoubleTap = () => {
    if (accumulatedScale.value == 1) {
      accumulatedScale.value = withTiming(MAX_SCALE, { duration: 200 })
      curScale.value = MAX_SCALE
      disableParentListScroll()
    } else {
      resetValues(true)
      enableParentListScroll()
    }
  }

  const disableParentListScroll = () => {
    listRef.current.setNativeProps({ scrollEnabled: false })
  }

  const enableParentListScroll = () => {
    listRef.current.setNativeProps({ scrollEnabled: true })
  }

  const resetValues = (animated: boolean) => {
    curScale.value = 1
    accumulatedScale.value = animated ? withTiming(1, { duration: 150 }) : 1
    accumulatedX.value = 0
    accumulatedY.value = 0
    translateX.value = animated ? withTiming(0, { duration: 150 }) : 0
    translateY.value = animated ? withTiming(0, { duration: 150 }) : 0
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
        if (Math.abs(translationX) > 5 && Math.abs(translationY) < 5) {
          return
        }

        // Up Swipe started.
        if (translationY < -5 && Math.abs(translationX) < 10) {
          isSwipeUpStarted.value = true
        }

        if (isSwipeUpStarted.value && translationY < 0) {
          translateY.value = translationY
          bottomSheetOffset.value = translationY
          runOnJS(disableParentListScroll)()
        }
      }
    },
    onFinish(event, _, isCanceledOrFailed) {
      if (!isCanceledOrFailed) {
        accumulatedX.value = translateX.value
        accumulatedY.value = translateY.value

        if (!isZoomed.value) {
          if (isSwipeUpStarted.value) {
            bottomSheetOffset.value = withTiming(0)
            translateY.value = withTiming(accumulatedScale.value)
            runOnJS(enableParentListScroll)()
            isSwipeUpStarted.value = false
          } else {
            console.log("here onFinished ")
            
          }
        }
      }
    },
  })

  const onPinch = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive(event) {
      const newScale = curScale.value * event.scale
      if (newScale > 1 && newScale < MAX_SCALE) {
        accumulatedScale.value = newScale
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
      if (!isCanceledOrFailed) {
        if (curScale.value * event.scale < 1) {
          accumulatedScale.value = withTiming(1)
          curScale.value = 1
        } else if (curScale.value * event.scale > MAX_SCALE) {
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
      transform: [
        {
          translateY: bottomSheetOffset.value,
        },
      ],
    }
  })

  return (
    <View>
      <TapGestureHandler
        numberOfTaps={2}
        maxDist={10}
        onActivated={onDoubleTap}
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
                <Animated.Image
                  source={{ uri: asset.uri }}
                  fadeDuration={0}
                  resizeMode="contain"
                  style={[
                    { width: dims.width, aspectRatio: dims.width / dims.height },
                    animatedImageStyle,
                  ]}
                />
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </TapGestureHandler>
      <Animated.View
        style={[{ position: "absolute", bottom: 0, left: 0, right: 0 }, bottomSheetStyle]}
      >
        <View
          style={{
            borderBottomColor: "white",
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        />
        <Text>{moment(asset.modificationTime).format("ddd, Do MMM YYYY . h:mm")}</Text>
        <Text>Details</Text>
        <View style={{ flexDirection: "row" }}>
          <Text>Location</Text>
          <Text style={{ marginLeft: 10 }}>{asset.uri}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text>Location</Text>
          <Text style={{ marginLeft: 10 }}>{asset.uri}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text>Dimensions</Text>
          <Text style={{ marginLeft: 10 }}>
            {asset.width} X {asset.height}
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}
