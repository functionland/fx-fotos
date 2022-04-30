import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle } from "react"
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  scrollTo,
  runOnJS,
  useAnimatedReaction,
  Extrapolate,
} from "react-native-reanimated"
import { DataProvider, RecyclerListView } from "fula-recyclerlistview"
import { Constants } from "../../../theme/constants"
import { RecyclerAssetListSection, ViewType, GroupHeader } from "../../../types"
import RecyclerSectionItem from "./asset-items/recycler-section-item"
import ExternalScrollView from "../external-scroll-view"
import Cell from "../grid-provider/cell"
import { useColumnsNumber, useScale, usePinching } from "../grid-provider/gridContext"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../../navigators/home-navigator"
import { AppNavigationNames } from "../../../navigators/app-navigator"

import GridLayoutProvider from "../grid-provider/gridLayoutProvider"
import { LayoutTransitionRange, MIN_COLUMNS } from "../grid-provider/gridLayoutManager"
import { ThumbScroll } from "../../index"

export interface Props {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
  sections: RecyclerAssetListSection[]
  numCols: 2 | 3 | 4 | 5
  scale?: SharedValue<number>
  renderAheadOffset?: number
  disableAutoScrolling?: boolean
  disableRefreshControl?: boolean
  scrollRef?: React.RefObject<Animated.ScrollView>
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  scrollY: SharedValue<number> | undefined
  onSelectedItemsChange?: (assetIds: string[], selectionMode: boolean) => void
}

export interface ExtendedState {
  selectedGroups: { [key: string]: boolean }
  selectedAssets: { [key: string]: boolean }
  selectionMode: boolean
}
export interface RecyclerAssetListHandler {
  resetSelectedItems: () => void,
  toggleSelectionMode: () => void
}
// eslint-disable-next-line react/display-name
const RecyclerAssetList = forwardRef<RecyclerAssetListHandler, Props>(({
  navigation,
  sections,
  scrollHandler,
  scrollRef,
  scrollY,
  onSelectedItemsChange,
  ...extras
}, ref): JSX.Element => {
  const rclRef = useRef<RecyclerListView>()
  const [numColumns] = useColumnsNumber()
  const lastScrollY = useSharedValue(scrollY.value)
  const scale1 = useScale()
  const pinching = usePinching()
  const [containerSize, setContainerSize] = useState<number[]>(null)
  const layoutTransitionRange = useSharedValue<LayoutTransitionRange>(null)
  const visibileIndices = useSharedValue<number[]>(null)
  const [currentColumns, setCurrentColumns] = useState(numColumns.value)
  const [viewPortHeight, setViewPortHeight] = useState(0);
  const [extendedState, setExtendedState] = useState<ExtendedState>({
    selectedAssets: {},
    selectedGroups: {},
    selectionMode: false,
  })
  useImperativeHandle(ref, () => ({
    resetSelectedItems: () => {
      setExtendedState(prev => ({
        ...prev,
        selectedAssets: {}
      }))
    },
    toggleSelectionMode: () => {
      toggleSelectionMode()
    }
  }));
  const toggleSelectionMode = () => {
    setExtendedState((prevState) => {
      return {
        ...prevState,
        selectedAssets: {},
        selectionMode: !prevState.selectionMode,
      }
    })
  }

  const toggleSelection = (section: RecyclerAssetListSection) => {
    setExtendedState((prevState) => {
      if (!prevState.selectionMode) return prevState

      if (section.type === ViewType.MONTH) {
        prevState.selectedAssets[section.id] = !prevState.selectedAssets[section.id]
        // TODO: toggle all subgroups
        return {
          ...prevState,
          selectedAssets: { ...prevState.selectedAssets },
        }
      } else if (section.type === ViewType.DAY) {
        const data: GroupHeader = section.data
        prevState.selectedAssets[section.id] = !prevState.selectedAssets[section.id]
        data.subGroupIds?.forEach((id) => {
          if (id !== section.id) prevState.selectedAssets[id] = prevState.selectedAssets[section.id]
        })
        return {
          ...prevState,
          selectedAssets: { ...prevState.selectedAssets },
        }
      } else if (section.type === ViewType.ASSET) {
        prevState.selectedAssets[section.id] = !prevState.selectedAssets[section.id]
        return {
          ...prevState,
          selectedAssets: { ...prevState.selectedAssets },
        }
      }
      return prevState
    })
  }
  useEffect(() => {
    if (onSelectedItemsChange) {
      const assetIds = Object.keys(extendedState.selectedAssets).filter(key => extendedState.selectedAssets[key]);
      onSelectedItemsChange(assetIds, extendedState.selectionMode);
    }
  }, [extendedState])
  const onLongPress = useCallback((section: RecyclerAssetListSection) => {
    toggleSelectionMode()
    toggleSelection(section)
  }, [])

  const onPress = useCallback((section: RecyclerAssetListSection) => {
    if (!extendedState.selectionMode && section.type === ViewType.ASSET) {
      navigation.push(AppNavigationNames.PhotoScreen, { section: section })
    } else toggleSelection(section)
  }, [extendedState.selectionMode])

  const rowRenderer = useCallback(
    (
      type: ViewType,
      data: RecyclerAssetListSection,
      index: number,
      extendedState: ExtendedState,
    ): JSX.Element | null => {
      // Checks if value is *nullish*.
      if (data == null || index == null) {
        return null
      }
      return (
        <RecyclerSectionItem
          section={data}
          selectionMode={extendedState?.selectionMode}
          selected={!!extendedState.selectedAssets[data.id]}
          onLongPress={onLongPress}
          onPress={onPress}
        />
      )
    },
    [extendedState],
  )

  const getLayoutType = useCallback(
    (index) => {
      return sections[index].type
    },
    [sections],
  )

  const gridLayoutProvider = useMemo(
    () => new GridLayoutProvider(numColumns, scale1, getLayoutType),
    [getLayoutType],
  )
  const renderItemContainer = useCallback(
    (props: any, parentProps: any, children: React.ReactNode) => {
      return (
        <Cell
          {...props}
          pinching={pinching}
          lastScrollY={lastScrollY}
          scale={scale1}
          columnNumber={numColumns.value}
          layoutProvider={gridLayoutProvider}
          index={parentProps.index}
        >
          {children}
        </Cell>
      )
    },
    [gridLayoutProvider],
  )

  gridLayoutProvider.shouldRefreshWithAnchoring = false

  const dataProvider = useMemo(() => {
    console.log("dataProvider", sections?.length)
    let provider = new DataProvider(
      (r1: RecyclerAssetListSection, r2: RecyclerAssetListSection) => r1.id !== r2.id
    )
    provider = provider.cloneWithRows(sections, 0)
    // provider.getStableId = index => sections[index].id;
    console.log("provider.getSize()", provider.getSize())
    return provider
  }, [sections])

  const animatedReactionWrapper = () => {
    forcRenderRCL()
  }
  useEffect(() => {
    const heights = Object.values(
      gridLayoutProvider.getLayoutManager?.()?.getAllContentDimension()?.height || {},
    )
    if (heights.length) {
      setContainerSize(heights)
    }
  }, [gridLayoutProvider])
  useAnimatedReaction(
    () => {
      return { pinchingValue: pinching.value, numColumnsValue: numColumns.value }
    },
    (next, prev) => {
      if (
        prev &&
        !(next.pinchingValue && !prev?.pinchingValue) &&
        next.numColumnsValue !== prev?.numColumnsValue
      ) {
        runOnJS(animatedReactionWrapper)()
      }
    },
  )

  useAnimatedReaction(
    () => {
      return { scaleValue: scale1.value, pinchingValue: pinching.value }
    },
    (next, prev) => {
      if (!next.pinchingValue && !prev?.pinchingValue) return
      if (next.pinchingValue && !prev?.pinchingValue) lastScrollY.value = scrollY.value

      if (layoutTransitionRange.value) {
        const extrapolation = {
          extrapolateLeft: Extrapolate.CLAMP,
          extrapolateRight: Extrapolate.CLAMP,
        }
        const diffScrollY = interpolate(
          next.scaleValue,
          layoutTransitionRange.value.colsRange,
          layoutTransitionRange.value.translateY,
          extrapolation,
        )
        scrollTo?.(scrollRef, 0, diffScrollY + lastScrollY.value, false)
      }
    },
  )
  const containerStyle = useAnimatedStyle(() => {
    let style = {}

    if (!containerSize || !layoutTransitionRange.value) return style
    const extrapolation = {
      extrapolateLeft: Extrapolate.CLAMP,
      extrapolateRight: Extrapolate.CLAMP,
    }

    style = {
      height: interpolate(
        scale1.value,
        layoutTransitionRange.value.colsRange,
        containerSize,
        extrapolation,
      ),
    }
    return style
  }, [containerSize])

  console.log("Render: Recycle-Asset-List", currentColumns)

  const forcRenderRCL = () => {
    console.log("forcRenderRCL", numColumns.value)
    rclRef.current?.getVirtualRenderer()?._prepareViewabilityTracker()
    //rclRef.current?._onScroll(0, dyanmicScrollY.value + lastScrollY.value)
    setCurrentColumns(numColumns.value)
  }
  return (
    <View style={{ flex: 1 }} onLayout={(e) => {
      setViewPortHeight(e.nativeEvent.layout.height)
    }}>
      <ThumbScroll
        scrollY={scrollY}
        hideTimeout={2000}
        headerHeight={Constants.HeaderHeight}
        footerHeight={Constants.TabBarHeight}
        viewPortHeight={viewPortHeight}
        layoutHeight={containerSize?.[currentColumns - MIN_COLUMNS] || viewPortHeight}
        shouldIndicatorHide={false}
        scrollRef={scrollRef}
        showYearFilter={true}
        sections={sections}
        layoutProvider={gridLayoutProvider}
      />
      <RecyclerListView
        ref={rclRef}
        dataProvider={dataProvider}
        extendedState={extendedState}
        layoutProvider={gridLayoutProvider}
        rowRenderer={rowRenderer}
        externalScrollView={ExternalScrollView}
        scrollViewProps={{
          disableScrollViewPanResponder: false,
          scrollRefExternal: scrollRef,
          _onScrollExternal: scrollHandler,
        }}
        onVisibleIndicesChanged={(all = [], now, notNow) => {
          const visibleIndexValue = all[Math.floor(all.length / 2)] || 0
          if (!pinching.value && all && all.length) {
            visibileIndices.value = [...all]
            layoutTransitionRange.value = gridLayoutProvider
              .getLayoutManager()
              ?.getLayoutTransitionRangeForIndex(visibleIndexValue, numColumns.value)
          }
        }}
        stopRenderingOnAnimation={pinching}
        contentContainerStyle={{ paddingTop: 70 }}
        renderItemContainer={renderItemContainer}
        renderContentContainer={(props, children) => {
          return (
            <Animated.View {...props} style={[props.style, containerStyle]}>
              {children}
            </Animated.View>
          )
        }}
        {...extras}
      />
    </View>
  )
})
export default RecyclerAssetList
