import React, { MutableRefObject, useRef, useState } from "react"
import {useWindowDimensions } from "react-native"
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

const MAX_SCALE = 3
export const GalleryImage: React.FC<GalleryImageProps> = ({ asset, listRef }) => {
  const dims = useWindowDimensions()
  const imageScale = useSharedValue(1)
  const curScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const offsetX = useSharedValue(0)
  const offsetY = useSharedValue(0)
  const panHandlerRef = useRef(null)
  const pinchHandlerRef = useRef(null)
  const imageAspectRatio = useSharedValue(0);

  const [zoom, setZoom] = useState(true)

  const xLimit = useDerivedValue(() => {
    const width = dims.width / 2
    console.log("limit x ", width * imageScale.value - width)
    const limit = width * imageScale.value - width
    // if (offsetX.value > limit) {
    //   offsetX.value = limit
    //   translateX.value = limit
    // }
    // if (offsetX.value < -limit) {
    //   offsetX.value = -limit
    //   translateX.value = -limit
    // }
    return limit
  }, [imageScale.value])

  const yLimit = useDerivedValue(() => {
    const imageHeight = dims.width * imageAspectRatio.value
    const height = imageHeight / 2
    const limit = height * imageScale.value - height
    // if (offsetY.value > limit) {
    //   offsetY.value = limit
    //   translateY.value = limit
    // }
    // if (offsetY.value < -limit) {
    //   offsetY.value = -limit
    //   translateY.value = -limit
    // }
    return limit
  }, [imageScale.value])

  

  const onDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (imageScale.value == 1) {
      imageScale.value = withTiming(MAX_SCALE, { duration: 200 })
      curScale.value = MAX_SCALE
      // setZoom(true)
      disableParentListScroll()
    } else {
      resetValues(true)
      // setZoom(false)
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
    imageScale.value = animated ? withTiming(1, { duration: 150 }) : 1
    // translateX.value = interpolate(imageScale.value, [1, imageScale.value], [0, translateX.value])
    // translateY.value = interpolate(imageScale.value, [1, imageScale.value], [0, translateY.value])
    offsetX.value = 0
    offsetY.value = 0
    translateX.value = animated ? withTiming(0, { duration: 300 }) : 0
    translateY.value = animated ? withTiming(0, { duration: 300 }) : 0
  }

  const onPan = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive(event) {
      if (zoom) {
        const newX = offsetX.value + event.translationX
        const newY = offsetY.value + event.translationY
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
        offsetX.value = translateX.value
        offsetY.value = translateY.value
      }
    },
  })

  const onPinch = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive(event) {
      imageScale.value = curScale.value * event.scale
    },
    onFinish(event) {
      if (curScale.value * event.scale < 1) {
        imageScale.value = withTiming(1)
        curScale.value = 1
      } else if (curScale.value * event.scale > MAX_SCALE) {
        curScale.value = MAX_SCALE
        imageScale.value = withTiming(MAX_SCALE)
      } else {
        curScale.value = imageScale.value
      }
      //handle scroll on scale
      if (imageScale.value != 1) {
        runOnJS(disableParentListScroll)()
      } else {
        runOnJS(enableParentListScroll)()
      }
    },
  })

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: imageScale.value,
        },
        {
          translateX: translateX.value / imageScale.value,
        },
        {
          translateY: translateY.value / imageScale.value,
        },
      ],
    }
  })
  return (
      <TapGestureHandler
        numberOfTaps={2}
        maxDist={20}
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
                simultaneousHandlers={pinchHandlerRef}
              >
                <Animated.Image
                  source={{ uri: asset.uri }}
                  onLayout={(event) => {
                    // console.log('==> ', event.nativeEvent.layout)
                  }}
                  onLoad={(event) => {
                    imageAspectRatio.value = event.nativeEvent.source.width / event.nativeEvent.source.height;
                  }}
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
