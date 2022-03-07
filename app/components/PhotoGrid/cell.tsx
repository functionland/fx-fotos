import React,{memo} from 'react';
import Reanimated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Layout } from 'recyclerlistview';

import GridLayoutProvider from './GridLayoutProvider';
interface CellProps {
    layoutProvider: GridLayoutProvider
    style: any,
    index: number,
    columnNumber: number,
    scale: Reanimated.SharedValue<number>
}

const Cell: React.FC<CellProps> =  React.forwardRef(({ layoutProvider, columnNumber, index, scale, style, ...props }, ref) => {
    
    const layouts = layoutProvider.getLayoutManager()?.getLayoutsForIndex(index);
    const animationStyle = useAnimatedStyle(() => {
        if(scale.value-columnNumber===0)
            return {
                transform:[
                    {
                        scale: 1
                    }
                ]
            };
        if (layouts) {
            const currentLayout = layouts.find(o => o.colNum === columnNumber)?.layout as Layout;
            const finalLayouts = layouts.map((el, idx) => ({
                layout: el.layout,
                from: el.colNum,
            })) as Array<{ layout: Layout, from: number }>;
            if (finalLayouts.length === 1) return {};
            const fromValues = finalLayouts.map(el => el.from);

            const extrapolation = {
                extrapolateLeft: Extrapolate.CLAMP,
                extrapolateRight: Extrapolate.CLAMP,
            };
            const finalScale = interpolate(scale.value, fromValues, finalLayouts.map(el => {
                if (el.layout.width && currentLayout.width) {
                    return el.layout.width / currentLayout.width;
                }
                return 1;
            }));
            const translateOrigin = (center: number, d: number) => {
                // Scale transform is centered, so we adjust the translation to make it appears as it happens from the top-left corner
                return center - d / 2;
            }

            return {
                transform: [{
                    translateX: interpolate(
                        scale.value,
                        fromValues,
                        finalLayouts.map(el => translateOrigin(el.layout.x - currentLayout.x, currentLayout.width - el.layout.width)),
                    ),
                }, {
                    translateY: interpolate(
                        scale.value,
                        fromValues,
                        finalLayouts.map(el => translateOrigin(el.layout.y - currentLayout.y, currentLayout.width - el.layout.width)),
                    )
                }, {
                    scale: finalScale
                }]
            }
        }
        return {}
    })
    return (
        <Reanimated.View  {...props} style={[{borderWidth:1,borderColor:"red"},style, animationStyle ]}>
            {props.children}
        </Reanimated.View >
    );
})

export default memo(Cell,(prevProps,nextProps)=>prevProps.index===nextProps.index);