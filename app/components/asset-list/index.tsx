import React, { memo, useState, useMemo, useRef } from 'react';
import { Text, View, TouchableHighlight, StyleSheet, ScrollViewProps, Animated as RAnimated, StatusBar } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    useAnimatedGestureHandler,
    interpolate,
    Extrapolate,
    withSpring,
    useAnimatedRef,
    scrollTo,
    SharedValue,
    useDerivedValue,
    withTiming,
    runOnJS
} from 'react-native-reanimated'
import { PinchGestureHandler, State, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import deviceUtils from '../../utils/deviceUtils'

import RecyclerAssetList from './recycler-asset-list';
import GridProvider from '../../components/PhotoGrid/GridContext'
import PinchZoom from '../../components/PhotoGrid/PinchZoom';

import { RecyclerAssetListSection } from "../../types"
interface Props {
    refreshData: () => Promise<void>;
    sections: RecyclerAssetListSection[];
    scrollY: SharedValue<number> | undefined;
}

const AssetList = ({
    refreshData,
    sections,
    scrollY,
}: Props): JSX.Element => {
    const [numCols, setColNums] = useState(4);
    const [counter, setCounter] = useState(2);
    const translationY = useSharedValue(0);
    const scrollRefExternal = useAnimatedRef<Animated.ScrollView>();
    const scale = useSharedValue(1);
    const lastScale = useSharedValue(1);
    const pinchStarted = useSharedValue(0);
    const changingView = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            translationY.value = event.contentOffset.y;

            if (scrollY)
                scrollY.value = translationY.value;
        },
        onBeginDrag: (e) => {
            //isScrolling.value = true;
        },
        onEndDrag: (e) => {
            //isScrolling.value = false;
        },
    });
    const x = useSharedValue(0);
    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startY = translationY.value;
        },
        onActive: (event, ctx) => {
            translationY.value = ctx.startY + event.translationY;
            //scrollTo(scrollRefExternal,0,translationY.value,true)
            console.log("onActive", event.translationY, event.velocityY)
        },
        onEnd: (_) => {
            x.value = withSpring(0);
        },
    });
    const changeView = (value) => {
        setColNums(cols => {
            changingView.value = withTiming(0);
            if (cols + value <= 5 && cols + value >= 2)
                return cols + value;
            return cols;
        });

    }
    useDerivedValue(() => {
        if (pinchStarted.value && !changingView.value) {
            const diff = scale.value - lastScale.value;
            if (scale.value !== 1 && Math.abs(diff) > 0.3) {

                changingView.value = 1;
                runOnJS(changeView)(diff > 0 ? -1 : 1);
                lastScale.value = scale.value;
            }
        }
    }, [scale])
    const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
        onStart: (event) => {
            pinchStarted.value = 1;
        },
        onActive: (event) => {
            if (!changingView.value)
                scale.value = event.scale;
        },
        onEnd: () => {
            pinchStarted.value = 0;
            lastScale.value = 1;
            scale.value = withTiming(1);
        },
    });
    
    return (
        <GridProvider>
            <PinchZoom>
                <RecyclerAssetList
                    refreshData={refreshData}
                    renderAheadOffset={1000 / numCols}
                    numCols={(numCols)}
                    sections={sections}
                    scrollHandler={scrollHandler}
                    scrollRef={scrollRefExternal}
                    scrollY={scrollY}
                />
            </PinchZoom>
        </GridProvider>
    );
};
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1,
        backgroundColor: "transparent"
    },
    box: {
        position: "absolute",
        top: 0,
        height: 30,
        width: 10,
        backgroundColor: "red",
        zIndex: 99,
        margin: 10
    }
})
export default AssetList;
