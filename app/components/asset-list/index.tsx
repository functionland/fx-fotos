import React from "react"
import {
    StyleSheet,
    Animated as RAnimated,
} from "react-native"
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedRef,
    SharedValue,
} from "react-native-reanimated"

import RecyclerAssetList from './recycler-asset-list';
import GridProvider from '../../components/PhotoGrid/GridContext'
import PinchZoom from '../../components/PhotoGrid/PinchZoom';

import { RecyclerAssetListSection } from "../../types"
import { StackNavigationProp } from "@react-navigation/stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/HomeNavigation"
interface Props {
    refreshData: () => Promise<void>
    sections: RecyclerAssetListSection[]
    scrollY: SharedValue<number> | undefined
    navigation: StackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

const AssetList = ({ refreshData, sections, scrollY, navigation }: Props): JSX.Element => {
    const translationY = useSharedValue(0)
    const scrollRefExternal = useAnimatedRef<Animated.ScrollView>()

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            translationY.value = event.contentOffset.y

            if (scrollY) scrollY.value = translationY.value
        },
        onBeginDrag: (e) => {
            //isScrolling.value = true;
        },
        onEndDrag: (e) => {
            //isScrolling.value = false;
        },
    })
    return (
        <GridProvider>
            <PinchZoom>
                <RecyclerAssetList
                    refreshData={refreshData}
                    sections={sections}
                    scrollHandler={scrollHandler}
                    scrollRef={scrollRefExternal}
                    scrollY={scrollY}
                />
            </PinchZoom>
        </GridProvider>
    );
}

export default AssetList;