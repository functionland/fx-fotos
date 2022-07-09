import React, { forwardRef, useImperativeHandle, useRef } from "react"
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  SharedValue,
} from "react-native-reanimated"

import RecyclerAssetList, { RecyclerAssetListHandler } from "./recycler-asset-list"
import GridProvider from "./grid-provider/gridContext"
import PinchZoom from "./grid-provider/pinchZoom"

import { RecyclerAssetListSection } from "../../types"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
interface Props {
  refreshData: () => Promise<void>
  sections: RecyclerAssetListSection[]
  scrollY: SharedValue<number> | undefined
  onSelectedItemsChange?: (assetIds: string[], selectionMode: boolean) => void
  onAssetLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
  renderFooter?: () => JSX.Element | JSX.Element[]
  onItemPress?: (section: RecyclerAssetListSection) => void
}
export interface AssetListHandle {
  resetSelectedItems: () => void,
  toggleSelectionMode: () => void
}
// eslint-disable-next-line react/display-name
const AssetList = forwardRef<AssetListHandle, Props>(({ refreshData, sections, scrollY, onSelectedItemsChange, onAssetLoadError, renderFooter, onItemPress }, ref): JSX.Element => {
  const translationY = useSharedValue(0)
  const scrollRefExternal = useAnimatedRef<Animated.ScrollView>()
  const recyclerAssetListRef = useRef<RecyclerAssetListHandler>();
  useImperativeHandle<AssetListHandle>(ref, () => ({
    resetSelectedItems: () => {
      recyclerAssetListRef.current?.resetSelectedItems()
    },
    toggleSelectionMode: () => {
      recyclerAssetListRef.current?.toggleSelectionMode()
    }
  }));
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      translationY.value = event.contentOffset.y

      if (scrollY) scrollY.value = translationY.value
    },
  })

  return (
    <GridProvider>
      <PinchZoom>
        <RecyclerAssetList
          ref={recyclerAssetListRef}
          refreshData={refreshData}
          sections={sections}
          scrollHandler={scrollHandler}
          scrollRef={scrollRefExternal}
          scrollY={scrollY}
          onSelectedItemsChange={onSelectedItemsChange}
          onAssetLoadError={onAssetLoadError}
          renderFooter={renderFooter}
          onItemPress={onItemPress}
        />
      </PinchZoom>
    </GridProvider>
  )
})

export default AssetList
