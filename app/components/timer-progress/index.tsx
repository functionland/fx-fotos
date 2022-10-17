import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  forwardRef,
  useRef,
  useState,
} from 'react'
import { View, LayoutChangeEvent, ViewStyle, StyleProp } from 'react-native'
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated'
import { withPause } from 'react-native-redash'

const DEFAULT_COLOR = '#9e9e9e'
const DEFAULT_ANIMATION_COLOR = 'white'
const DEFAULT_BORDER_COLOR = '#9e9e9e'
const DEFAULT_HEIGHT = 1.5
const DEFAULT_BORDER_RADIUS = 1
const DEFAULT_BORDER_WIDTH = 0
const DEFAULT_DURATION = 3000
export interface Props {
  /**
   * Height of the progress bar.
   * @default 6
   */
  height?: number

  /**
   * Color of indicator
   * @default '#0057e7'
   */
  color?: string
  /**
   * Color of indicator
   * @default 'white'
   */
  animationColor?: string

  /**
   * Rounding of corners, set to 0 to disable.
   * @default 4
   */
  borderRadius?: number

  /**
   * Color of outer border.
   * @default '#0057e7'
   */
  borderColor?: string

  /**
   * Width of outer border, set to 0 to remove.
   * @default 1
   */
  borderWith?: number
  /**
   * timer duration mmilisecond
   */
  duration: number
  /**
   * puse the progress
   */
  pause?: Animated.SharedValue<boolean>
  /**
   * Call when progress done
   */
  onTimerEnd?: () => void
  onLayout?: (e: LayoutChangeEvent) => void
  barCount: number
}
export interface TimerProgressHandler {
  start: (currentIndex: number) => void
  stop: () => void
}
// eslint-disable-next-line react/display-name
export const TimerProgress = forwardRef<TimerProgressHandler, Props>(
  (
    {
      borderWith = DEFAULT_BORDER_WIDTH,
      borderColor = DEFAULT_BORDER_COLOR,
      borderRadius = DEFAULT_BORDER_RADIUS,
      color = DEFAULT_COLOR,
      animationColor = DEFAULT_ANIMATION_COLOR,
      height = DEFAULT_HEIGHT,
      duration = DEFAULT_DURATION,
      pause,
      onTimerEnd,
      onLayout,
      barCount,
    },
    ref,
  ) => {
    // variable
    const barWidth = useRef(0)
    const [currentBarIndex, setCurrentBarIndex] = useState(0)
    const [animating, setAnimating] = useState(false)
    const width = useSharedValue(0)
    const onAimationEnd = () => {
      onTimerEnd?.()
      setAnimating(false)
    }
    useImperativeHandle(ref, () => ({
      start: (currentIndex: number) => {
        width.value = 0
        setAnimating(true)
        setCurrentBarIndex(currentIndex || 0)
        width.value = withPause(
          withTiming(
            100,
            {
              duration,
              easing: Easing.linear,
            },
            () => {
              if (width.value) runOnJS(onAimationEnd)()
            },
          ),
          pause,
        )
      },
      stop: () => {
        cancelAnimation(width)
      },
    }))
    const animatedStyle = useAnimatedStyle(
      () => ({
        width: `${width.value}%`,
      }),
      [onTimerEnd],
    )
    // function
    const _onLayout = useCallback((e: LayoutChangeEvent) => {
      barWidth.current = e.nativeEvent.layout.width
      onLayout?.(e)
    }, [])

    // style
    const containerStyle = useMemo(
      () =>
        [
          {
            flex: 1,
            height,
            borderRadius,
            borderWidth: borderWith,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: color,
            borderColor,
            overflow: 'hidden',
            marginHorizontal: 1,
          },
        ] as StyleProp<ViewStyle>,
      [height, color, borderRadius],
    )
    const mainContainerStyle = useMemo(
      () =>
        [
          {
            width: '100%',
            height,
            borderRadius,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            flexDirection: 'row',
          },
        ] as StyleProp<ViewStyle>,
      [height, borderRadius],
    )
    const progressStyle = useMemo(
      () =>
        [
          {
            backgroundColor: animationColor,
            left: 0,
            position: 'absolute',
            borderRadius,
            height: '100%',
            width: '100%',
          },
        ] as StyleProp<ViewStyle>,
      [],
    )
    // render
    const bars = []
    for (let index = 0; index < barCount; index++) {
      if (index < currentBarIndex) {
        bars.push(
          <View
            key={'filled' + index}
            style={[containerStyle, { backgroundColor: animationColor }]}
          ></View>,
        )
      } else if (index === currentBarIndex) {
        bars.push(
          <View key={'animating' + index} style={containerStyle}>
            <Animated.View
              style={[progressStyle, animating ? animatedStyle : {}]}
            />
          </View>,
        )
      } else {
        bars.push(
          <View
            key={'waiting' + index}
            style={[containerStyle, { backgroundColor: color }]}
          ></View>,
        )
      }
    }
    return (
      <View onLayout={_onLayout} style={mainContainerStyle}>
        {/* {bars.map((Bar, index) => (
          <Bar key={index} />
        ))} */}
        {bars}
      </View>
    )
  },
)
