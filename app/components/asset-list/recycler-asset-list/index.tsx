
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StatusBar, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Transition,
  scrollTo,
  runOnJS,
  useAnimatedReaction,
  Extrapolate
} from 'react-native-reanimated';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
  Layout
} from 'fula-recyclerlistview';
import { RecyclerAssetListSection, ViewType, GroupHeader } from "../../../types"
import deviceUtils from '../../../utils/deviceUtils'
import RecyclerSectionItem from "./asset-items/recycler-section-item"
import ExternalScrollView from '../external-scroll-view'
import Cell from '../../../components/PhotoGrid/cell'
import { useColumnsNumber, useScale, usePinching } from '../../../components/PhotoGrid/GridContext';

import GridLayoutProvider from '../../../components/PhotoGrid/GridLayoutProvider'
import { LayoutTransitionRange, MIN_COLUMNS } from '../../../components/PhotoGrid/GridLayoutManager'
export interface Props {
  sections: RecyclerAssetListSection[];
  numCols: 2 | 3 | 4 | 5;
  scale?: SharedValue<number>,
  renderAheadOffset?: number;
  disableAutoScrolling?: boolean;
  disableRefreshControl?: boolean;
  scrollRef?: any,
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollY: SharedValue<number> | undefined;
};

export interface ExtendedState {
  selectedGroups: { [key: string]: boolean }
  selectedAssets: { [key: string]: boolean }
  selectionMode: boolean
}
const RecyclerAssetList = ({
  navigation,
  sections,
  scrollHandler,
  scrollRef,
  scrollY,
  ...extras
}: Props): JSX.Element => {
  const rclRef = useRef<RecyclerListView>();
  const [numColumns] = useColumnsNumber();
  const lastScrollY = useSharedValue(scrollY.value);
  const dyanmicScrollY = useSharedValue(scrollY.value);
  const scale1 = useScale();
  const pinching = usePinching();
  const [containerSize, setContainerSize] = useState<number[]>(null);
  const [, setAllLayouts] = useState<Layout[][]>(null);
  const layoutTransitionRange = useSharedValue<LayoutTransitionRange>(null);
  const visibileIndices = useSharedValue<number[]>(null);
  const [currentColumns, setCurrentColumns] = useState(numColumns);
  
  const [extendedState, setExtendedState] = useState<ExtendedState>({
    selectedAssets: {},
    selectedGroups: {},
    selectionMode: false,
  });
 
  const toggleSelectionMode = () => {
    setExtendedState((prevState) => {
      return {
        ...prevState,
        selectedAssets: {},
        selectionMode: !prevState.selectionMode,
      }
    });
  };

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
  const onLongPress = useCallback((section: RecyclerAssetListSection) => {
    toggleSelectionMode()
    toggleSelection(section)
  }, [])

  const onPress = useCallback((section: RecyclerAssetListSection) => {
    toggleSelection(section)
  }, [])

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
          navigation={navigation}
        />
      )
    },
    []
  );

  const getLayoutType = useCallback((index) => {
    return sections[index].type
  }, [sections])

  const gridLayoutProvider = useMemo(() => (new GridLayoutProvider(numColumns, scale1, getLayoutType)), [getLayoutType])
  const renderItemContainer = useCallback((props: any, parentProps: any, children: React.ReactNode) => {
    return (
      <Cell {...props} pinching={pinching} dynamicScrollY={dyanmicScrollY} lastScrollY={lastScrollY} scale={scale1} columnNumber={numColumns.value} layoutProvider={gridLayoutProvider} index={parentProps.index}>
        {children}
      </Cell>
    );
  }, [gridLayoutProvider])

  gridLayoutProvider.shouldRefreshWithAnchoring = false;
  
  const dataProvider = useMemo(() => {
    console.log("dataProvider", sections?.length)
    let provider = new DataProvider(
      (r1: RecyclerAssetListSection, r2: RecyclerAssetListSection) => r1.id !== r2.id,
      (index) => sections[index]?.id,
    )
    provider = provider.cloneWithRows(sections)
    // provider.getStableId = index => sections[index].id;
    console.log("provider.getSize()", provider.getSize())
    return provider;
  }, [sections]);

  const animatedReactionWrapper = () => {
    forcRenderRCL();
  };

  useAnimatedReaction(() => {
    return { pinchingValue: pinching.value, numColumnsValue: numColumns.value };
  }, (next, prev) => {

    if (prev && !(next.pinchingValue && !prev?.pinchingValue) && next.numColumnsValue !== prev?.numColumnsValue) {
      runOnJS(animatedReactionWrapper)();
    }
  });

  useAnimatedReaction(
    () => {
      return { scaleValue: scale1.value, pinchingValue: pinching.value }
    },
    (next, prev) => {
      if (next.pinchingValue && !prev?.pinchingValue)
        lastScrollY.value = scrollY.value;

      if (layoutTransitionRange.value) {
        const extrapolation = {
          extrapolateLeft: Extrapolate.CLAMP,
          extrapolateRight: Extrapolate.CLAMP,
        };
        const diffScrollY = interpolate(next.scaleValue, layoutTransitionRange.value.colsRange, layoutTransitionRange.value.translateY, extrapolation)
        const dynamicHeight = interpolate(next.scaleValue, layoutTransitionRange.value.colsRange, containerSize, extrapolation)
        console.log("diffScrollY", dynamicHeight, diffScrollY + lastScrollY.value)
        scrollTo?.(scrollRef, 0, diffScrollY + lastScrollY.value, false)
        dyanmicScrollY.value = diffScrollY;
      }
    },
    [containerSize]
  );
  const containerStyle = useAnimatedStyle(() => {
    let style = {}
    
    if (!containerSize || !layoutTransitionRange.value)
      return style;
    const extrapolation = {
      extrapolateLeft: Extrapolate.CLAMP,
      extrapolateRight: Extrapolate.CLAMP,
    };
    
    style = {
      height: interpolate(scale1.value, layoutTransitionRange.value.colsRange, containerSize, extrapolation)
    }
   
    console.log("containerStyle", style.height)
    return style;
  }, [containerSize])

  console.log("Render: Recycle-Asset-List", currentColumns)

  const forcRenderRCL = () => {
    console.log("forcRenderRCL", numColumns.value);
    rclRef.current?.getVirtualRenderer()?._prepareViewabilityTracker();
    rclRef.current?._onScroll(0, dyanmicScrollY.value + lastScrollY.value)
    setCurrentColumns(numColumns.value)
  }
  return (
    <RecyclerListView
      ref={rclRef}
      dataProvider={dataProvider}
      extendedState={extendedState}
      layoutProvider={gridLayoutProvider}
      rowRenderer={rowRenderer}
      externalScrollView={ExternalScrollView}
      scrollViewProps={{
        scrollRefExternal: scrollRef,
        _onScrollExternal: scrollHandler,
      }}
      onVisibleIndicesChanged={(all = [], now, notNow) => {
        const visibleIndexValue = all[Math.floor(all.length / 2)] || 0;
        if (!pinching.value && all && all.length) {
          visibileIndices.value = [...all];
          layoutTransitionRange.value = gridLayoutProvider.getLayoutManager()?.getLayoutTransitionRangeForIndex(visibleIndexValue, numColumns.value)
        }
      }}
      stopRenderingOnAnimation={pinching}
      contentContainerStyle={{ paddingTop: 100 }}
      renderItemContainer={renderItemContainer}
      renderContentContainer={(props, children) => {
        return (
          <Animated.View {...props} style={[props.style, containerStyle]} onLayout={(event: LayoutChangeEvent) => {
            if (!containerSize) {
              const heights = Object.values(gridLayoutProvider?.getLayoutManager?.()?.getAllContentDimension()?.height);
              setContainerSize(heights);
              setAllLayouts(gridLayoutProvider?.getLayoutManager?.()?.getAllLayouts())
            } else if (!pinching.value) {
              console.log("onLayout", event.nativeEvent.layout.height)
              //forcRenderRCL();
            }
          }}>
            {children}
          </Animated.View>
        );
      }}
      {...extras}
    />
  );
}
export default RecyclerAssetList;
