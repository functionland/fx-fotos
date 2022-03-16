import React, { memo } from 'react';
import Reanimated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle, ExtrapolationType } from 'react-native-reanimated';
import GridLayoutProvider from './gridLayoutProvider';
interface CellProps {
    layoutProvider: GridLayoutProvider
    style: any,
    index: number,
    columnNumber: number,
    scale: Reanimated.SharedValue<number>
    pinching: Reanimated.SharedValue<boolean>
    lastScrollY: SharedValue<number> | undefined;
    dynamicScrollY: SharedValue<number> | undefined;
}

// eslint-disable-next-line react/display-name
const Cell: React.FC<CellProps> = React.forwardRef(({ layoutProvider, columnNumber, index, scale, style, pinching, ...props }, ref) => {
    const finalRangeValues = layoutProvider.getLayoutManager()?.getLayoutTransitionRangeForIndex(index, columnNumber);
    const colsRange = finalRangeValues.colsRange;
    const animationStyle = useAnimatedStyle(() => {

        const extrapolation = {
            extrapolateLeft: Extrapolate.CLAMP,
            extrapolateRight: Extrapolate.CLAMP,
        };
        if (!pinching.value && scale.value === columnNumber) {
            return {
                transform: [
                    {
                        scale: 1
                    }
                ]
            };
        }

        if (colsRange.length) {

            if (colsRange.length === 1) return {};

            const finalScale = interpolate(scale.value, colsRange, finalRangeValues.scale);
            const finalTranslateY = interpolate(
                scale.value,
                colsRange,
                finalRangeValues.translateY,
                extrapolation
            );

            return {
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
        return {}
    })
    return (
        <Reanimated.View  {...props} style={[style, animationStyle]}>
            {props.children}
        </Reanimated.View >
    );
})
const areEqual = (prev: Props, next: Props) => {
    return (prev.index === next.index) || (prev?.pinching.value === true && next.pinching.value === true)
}
export default memo(Cell, areEqual);