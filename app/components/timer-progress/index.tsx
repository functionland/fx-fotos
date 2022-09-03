import React, { useCallback, useImperativeHandle, useMemo, forwardRef, useRef } from 'react'
import { View, LayoutChangeEvent, ViewStyle, StyleProp } from 'react-native'
import Animated, { withTiming, useSharedValue, useAnimatedStyle, Easing, cancelAnimation, runOnJS } from 'react-native-reanimated'
import { withPause } from 'react-native-redash';

const DEFAULT_COLOR = '#9e9e9e';
const DEFAULT_BORDER_COLOR = "#9e9e9e";
const DEFAULT_HEIGHT = 5;
const DEFAULT_BORDER_RADIUS = 4;
const DEFAULT_BORDER_WIDTH = 1;
const DEFAULT_DURATION = 3000;
export interface Props {

    /**
     * Height of the progress bar.
     * @default 6
     */
    height?: number;

    /**
     * Color of indicator
     * @default '#0057e7'
     */
    color?: string;

    /**
     * Rounding of corners, set to 0 to disable.
     * @default 4
     */
    borderRadius?: number;

    /**
     * Color of outer border.
     * @default '#0057e7'
     */
    borderColor?: string;

    /**
     * Width of outer border, set to 0 to remove.
     * @default 1
     */
    borderWith?: number;
    /**
     * timer duration mmilisecond
     */
    duration: number,
    /**
     * puse the progress
     */
    pause?:Animated.SharedValue<boolean>
    /**
     * Call when progress done
     */
    onTimerEnd?: () => void
    onLayout?: (e:LayoutChangeEvent) => void

}
export interface TimerProgressHandler {
    start: () => void,
    stop: () => void
}
// eslint-disable-next-line react/display-name
export const TimerProgress = forwardRef<TimerProgressHandler, Props>(({
    borderWith = DEFAULT_BORDER_WIDTH,
    borderColor = DEFAULT_BORDER_COLOR,
    borderRadius = DEFAULT_BORDER_RADIUS,
    color = DEFAULT_COLOR,
    height = DEFAULT_HEIGHT,
    duration = DEFAULT_DURATION,
    pause,
    onTimerEnd,
    onLayout }, ref) => {
    // variable
    const barWidth = useRef(0)
    const width = useSharedValue(0);
    useImperativeHandle(ref, () => ({
        start: () => {
            width.value=0
            width.value = withPause(withTiming(barWidth.current, {
                duration: duration,
                easing: Easing.linear
            }, () => {
                if(width.value)
                    runOnJS(onTimerEnd)()
            }),pause)
        },
        stop: () => {
            cancelAnimation(width);
        }
    }))
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: width.value
        };
    },[onTimerEnd]);
    // function
    const _onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            barWidth.current = e.nativeEvent.layout.width
            onLayout?.(e)
        },
        [],
    )

    // style
    const containerStyle = useMemo(() => [{
        width: '100%',
        height: height,
        borderRadius: borderRadius,
        borderWidth: borderWith,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderColor: borderColor,
        overflow: 'hidden'
    }] as StyleProp<ViewStyle>, [height, color, borderRadius])
    
    const progressStyle = [{
        backgroundColor: color,
        left: 0,
        position: 'absolute',
        borderRadius: borderRadius,
        height: '100%',
    }] as StyleProp<ViewStyle>;

    // render
    return (
        <View onLayout={_onLayout} style={containerStyle}>
            <Animated.View style={[progressStyle, animatedStyle]} />
        </View>
    )
})


