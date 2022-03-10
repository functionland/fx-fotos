import React, { memo } from 'react';
import Reanimated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle, ExtrapolationType } from 'react-native-reanimated';
import { Layout } from 'recyclerlistview';

import GridLayoutProvider from './GridLayoutProvider';
interface CellProps {
    layoutProvider: GridLayoutProvider
    style: any,
    index: number,
    columnNumber: number,
    scale: Reanimated.SharedValue<number>
    pinching: Reanimated.SharedValue<boolean>
    lastScrollY: SharedValue<number> | undefined;
    dynamicScrollY: SharedValue<number> | undefined;
    visibleIndex: SharedValue<number> | undefined;

}
const translateOrigin = (center: number, d: number) => {
    // Scale transform is centered, so we adjust the translation to make it appears as it happens from the top-left corner
    return center - d / 2;
}
// eslint-disable-next-line react/display-name
const Cell: React.FC<CellProps> = React.forwardRef(({ layoutProvider, columnNumber, index, scale, style, lastScrollY, dynamicScrollY, pinching, visibleIndex, ...props }, ref) => {
    const layouts = layoutProvider.getLayoutManager()?.getLayoutsForIndex(index);
    const fromValues = Object.keys(layouts || {}).map(key => Number(key));//. finalLayouts.map(el => el.from);
    const currentLayout = layouts?.[columnNumber];
    const finalLayouts = Object.values(layouts || {});
    const finalRangeValues = finalLayouts.reduce((obj, layout) => {
        obj.translateX.push(translateOrigin(layout.x - currentLayout.x, currentLayout.width - layout.width))
        obj.translateY.push(translateOrigin(layout.y - currentLayout.y, currentLayout.width - layout.width))
        if (layout.width && currentLayout.width) {
            obj.scale.push(layout.width / currentLayout.width);
        } else
            obj.scale.push(1)

        return obj;

    }, {
        translateX: [],
        translateY: [],
        scale: []
    })
    const animationStyle = useAnimatedStyle(() => {
        //layouts.find(o => o.colNum === columnNumber.value)?.layout as Layout;
        //console.log("cell animationStyle",columnNumber,scale.value,lastScale);

        // if (!pinching.value && Math.floor(scale.value) === scale.value) {
        //     lastScale = scale.value;
        // }
        if (!pinching.value && scale.value === columnNumber) {
            return {
                transform: [
                    {
                        scale: 1
                    }
                ]
            };
        }

        if (fromValues.length) {

            // const finalLayouts = layouts.map((el, idx) => ({
            //     layout: el.layout,
            //     from: el.colNum,
            // })) as Array<{ layout: Layout, from: number }>;

            if (fromValues.length === 1) return {};


            const extrapolation = {
                extrapolateLeft: Extrapolate.CLAMP,
                extrapolateRight: Extrapolate.CLAMP,
            };


            const finalScale = interpolate(scale.value, fromValues, finalRangeValues.scale);
            const finalTranslateY = interpolate(
                scale.value,
                fromValues,
                finalRangeValues.translateY,
                extrapolation
            );

            if (pinching.value && visibleIndex.value === index) {
                dynamicScrollY.value = finalTranslateY;
            }
            return {
                transform: [{
                    translateX: interpolate(
                        scale.value,
                        fromValues,
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
export default memo(Cell, (prevProps, nextProps) => prevProps.index === nextProps.index || (prevProps.pinching.value===true && nextProps.pinching.value===true));