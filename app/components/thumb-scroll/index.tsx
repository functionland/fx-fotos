import React, { useEffect, createRef } from "react"

import { StyleSheet, useWindowDimensions, StyleProp, Image, Text, View } from "react-native"

import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler"
import Animated, {
  default as Reanimated,
  useAnimatedStyle,
  Extrapolate,
  useAnimatedGestureHandler,
  withDelay,
  withTiming,
  interpolate,
  useSharedValue,
  scrollTo,
  useAnimatedReaction
} from "react-native-reanimated"

interface Props {
  indicatorHeight: number
  hideTimeout: number
  dragY?: Reanimated.SharedValue<number>
  scrollY: Reanimated.SharedValue<number>
  viewPortHeight: number
  layoutHeight: number
  headerHeight: number
  footerHeight: number
  scrollRef?: React.RefObject<Animated.ScrollView>
}
export const ThumbScroll: React.FC<Props> = (props) => {
  const opacity = useSharedValue<number>(1);
  Reanimated.addWhitelistedNativeProps({ text: true })
  const _onPanGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { prevScrollY: number }
  >({
    onStart: (_, ctx) => {
      opacity.value = withTiming(1, { duration: 1000 })
      ctx.prevScrollY = props.scrollY.value
    },
    onActive: (event, ctx) => {
      const diff = ctx.prevScrollY +
        (event.translationY * (props.layoutHeight)) / props.viewPortHeight;
      if (props.dragY)
        props.dragY.value = diff;

      scrollTo(props.scrollRef, 0, diff, false);
    },
    onEnd: () => {
      opacity.value = withDelay(props.hideTimeout, withTiming(0, { duration: 0 }))
    },
    onCancel: () => {
      opacity.value = withDelay(props.hideTimeout, withTiming(0, { duration: 0 }))
    },
    onFail: () => {
      opacity.value = withDelay(props.hideTimeout, withTiming(0, { duration: 0 }))
    },
    onFinish: () => {
      opacity.value = withDelay(props.hideTimeout, withTiming(0, { duration: 0 }))
    },
  })
  useAnimatedReaction(() => props.scrollY.value,
    () => {
      if (opacity.value === 0)
        opacity.value = 1
      else
        opacity.value = withDelay(props.hideTimeout, withTiming(0, { duration: 0 }))
    }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            props.scrollY.value * (props.viewPortHeight / (props.layoutHeight - props.viewPortHeight)),
            [0, props.viewPortHeight],
            [props.headerHeight, props.viewPortHeight - props.footerHeight],
            Extrapolate.CLAMP,
          ),
        },
        {
          translateX: withTiming(interpolate(opacity.value, [0, 1], [40, 0], Extrapolate.CLAMP), { duration: 500 })
        },
      ],
    }
  })
  if (!props.viewPortHeight || !props.layoutHeight)
    return null;
  return (
    <Reanimated.View style={[styles.scrollIndicatorContainer, { height: props.indicatorHeight }, animatedStyle]}>
      <PanGestureHandler
        onGestureEvent={_onPanGestureEvent}
        maxPointers={1}
        minPointers={1}
        shouldCancelWhenOutside={false}
        ////hitSlop={{ right: 0, width:140 }}
        avgTouches={false}
        enableTrackpadTwoFingerGesture={false}
      >
        <Reanimated.View
          style={[
            styles.scrollIndicator,
            {
              height: props.indicatorHeight,
              zIndex: 5,
            },
            props.scrollIndicatorStyle,
          ]}
        >
          <View style={styles.scrollBar}>
            <Image
              source={require("../../../assets/images/scroll.png")}
              style={[styles.image]}
              resizeMethod="resize"
              resizeMode="stretch"
            />
          </View>
        </Reanimated.View>
      </PanGestureHandler>
    </Reanimated.View>
  )
}

const styles = StyleSheet.create({
  scrollIndicatorContainer: {
    top: 0,
    position: "absolute",
    right: 0,
    width: 50,
    height: 50,
    opacity: 1,
    zIndex: 99,
  },
  scrollIndicator: {
    right: -15,
    zIndex: 4,
    borderRadius: 50,
    backgroundColor: "whitesmoke",
    height: 50,
    width: 50,
    flexWrap: "wrap",
  },
  image: {
    marginLeft: 12,
    height: 20,
    width: 10,
    marginTop: 15,
  },
  scrollBar: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  scrollBarText: {
    position: "absolute",
    right: 30,
    top: 10,
    backgroundColor: "white",
    opacity: 0.8,
    color: "black",
    width: 100,
    borderRadius: 100,
    alignItems: "center",
  },
})
