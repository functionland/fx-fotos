import React, { MutableRefObject, useEffect, useRef, useState } from "react"
import { useWindowDimensions } from "react-native"
import {
  FlatList,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { Asset } from "../../types"

type GalleryImageProps = {
  asset: Asset
  listRef: MutableRefObject<FlatList>
}

const MAX_SCALE = 6
export const GalleryImage: React.FC<GalleryImageProps> = ({ asset, listRef }) => {
  const dims = useWindowDimensions()
  const accumulatedScale = useSharedValue(1)
  const curScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const accumulatedX = useSharedValue(0)
  const accumulatedY = useSharedValue(0)
  const panHandlerRef = useRef(null)
  const pinchHandlerRef = useRef(null)

  const [isZoomed, setIsZoomed] = useState(false)

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
  }, [accumulatedScale.value])

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
  }, [accumulatedScale.value])

  const onDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (accumulatedScale.value == 1) {
      accumulatedScale.value = withTiming(MAX_SCALE, { duration: 200 })
      curScale.value = MAX_SCALE
      setIsZoomed(true)
      disableParentListScroll()
    } else {
      resetValues(true)
      setIsZoomed(false)
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
      if (isZoomed) {
        const newX = accumulatedX.value + event.translationX
        const newY = accumulatedY.value + event.translationY
        if (newX < xLimit.value && newX > -xLimit.value) {
          translateX.value = newX
        }
        if (newY < yLimit.value && newY > -yLimit.value) {
          translateY.value = newY
        }
      }
    },
    onFinish(event, context, isCanceledOrFailed) {
      if (!isCanceledOrFailed) {
        accumulatedX.value = translateX.value
        accumulatedY.value = translateY.value
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
          runOnJS(setIsZoomed)(true)
          runOnJS(disableParentListScroll)()
        } else {
          runOnJS(setIsZoomed)(false)
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
  return (
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
              enabled={isZoomed}
              ref={panHandlerRef}
              onGestureEvent={onPan}
              simultaneousHandlers={pinchHandlerRef}
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
  )
}
