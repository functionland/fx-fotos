import React, { memo, useState, useMemo } from 'react';
import { Text, View, TouchableHighlight, StyleSheet, ScrollViewProps,Animated as RAnimated } from 'react-native'
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
    SharedValue

} from 'react-native-reanimated'
import { PanGestureHandler } from 'react-native-gesture-handler';
import deviceUtils from '../../utils/deviceUtils'

import RecyclerAssetList from './recycler-asset-list';

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
    const translationY = useSharedValue(0);
    const scrollRefExternal = useAnimatedRef<Reanimated.ScrollView>();
    
    const scrollViewProps = useMemo(
        (): Partial<ScrollViewProps> =>
        ({
            onScrollBeginDrag: (e) => {
                console.log("onScrollBeginDrag")
            },
            onScrollEndDrag: (e) => {
                console.log("onEndDrag")
            }
        }),
        []
    );
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            translationY.value = event.contentOffset.y;
            
            if(scrollY)
                scrollY.value=translationY.value;
            console.log("event.contentOffset.y:",scrollY?.value)
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
            console.log("onStart", ctx)
        },
        onActive: (event, ctx) => {
            translationY.value = ctx.startY + event.translationY;
            //scrollTo(scrollRefExternal,0,translationY.value,true)
            console.log("onActive", event.translationY, event.velocityY)
        },
        onEnd: (_) => {
            x.value = withSpring(0);
            console.log("onEnd")
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: x.value,
                },
            ],
        };
    });

    return (<View style={styles.container}>
        {/* <TouchableHighlight style={{ width: "100%", height: 50, justifyContent: "center", alignItems: "center", backgroundColor: "grey" }} onPress={() => {
            if (numCols < 5)
                setColNums(numCols + 1)
            else
                setColNums(1)

        }}>
            <Text style={{ fontSize: 20 }} >Change the view: {numCols}</Text>
        </TouchableHighlight> */}
        {/* <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.box, stylez]} />
        </PanGestureHandler> */}
        <RecyclerAssetList
            refreshData={refreshData}
            numCols={numCols}
            sections={sections}
            scrollHandler={scrollHandler}
            scrollRef={scrollRefExternal}
        />
    </View>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    box: {
        position:"absolute",
        top:0,
        height: 30,
        width: 10,
        backgroundColor: "red",
        zIndex: 99,
        margin: 10
    }
})
export default AssetList;
