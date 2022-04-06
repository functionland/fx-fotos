import React, { memo, useEffect, useRef, useCallback } from 'react';
import { ViewStyle } from "react-native"
import Reanimated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle, ExtrapolationType, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import GridLayoutProvider from './gridLayoutProvider';
interface CellProps {
    layoutProvider: GridLayoutProvider
    style: ViewStyle,
    index: number,
    columnNumber: number,
    scale: Reanimated.SharedValue<number>
    pinching: Reanimated.SharedValue<boolean>
    lastScrollY: SharedValue<number> | undefined;
}

// eslint-disable-next-line react/display-name
const Cell: React.FC<CellProps> = React.forwardRef(({ layoutProvider, columnNumber, index, scale, style, ...props }, ref) => {
    const sharedFinalRangeValues = useSharedValue(null);
    const externalStyle = useSharedValue<ViewStyle>(style);
    const animationStyle = useAnimatedStyle(() => {
        const extrapolation = {
            extrapolateLeft: Extrapolate.CLAMP,
            extrapolateRight: Extrapolate.CLAMP,
        };
        if (!sharedFinalRangeValues.value)
            return { ...externalStyle.value }
        const finalRangeValues = sharedFinalRangeValues.value;
        const colsRange = finalRangeValues.colsRange;
        if (colsRange.length) {
            if (colsRange.length === 1) return { ...externalStyle.value };

            const finalScale = interpolate(scale.value, colsRange, finalRangeValues.scale);
            const finalTranslateY = interpolate(
                scale.value,
                colsRange,
                finalRangeValues.translateY,
                extrapolation
            );

            return {
                ...externalStyle.value,
                transform: [{
                    translateX: interpolate(
                        scale.value,
                        colsRange,
                        finalRangeValues.translateX,
                        extrapolation
                    ),
                }, {
                    translateY: finalTranslateY
                }, {
                    scale: finalScale
                }]
            }
        }
        return { ...externalStyle.value }
    }, [])
    const updateDependencies = useCallback((index, columnNumber, style) => {
        sharedFinalRangeValues.value = layoutProvider.getLayoutManager()?.getLayoutTransitionRangeForIndex(index, columnNumber);
        externalStyle.value = style;
    }, [layoutProvider])

    useEffect(() => {
        updateDependencies(index, columnNumber, style);
    }, [index])

    return (
        <Reanimated.View ref={ref} {...props} style={animationStyle}>
            {props.children}
        </Reanimated.View >
    );
})
const areEqual = (prev: Props, next: Props) => {
    return (prev.index === next.index) || (prev?.pinching.value === true && next.pinching.value === true)
}

export default memo(Cell, areEqual);