
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StatusBar, NativeSyntheticEvent, View, NativeScrollEvent, ScrollViewProps, LayoutChangeEvent, StyleSheet, Platform } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Transitioning,
  Transition,
  scrollTo,
  useDerivedValue,
  runOnJS,
  useAnimatedReaction,
  withTiming,
  Extrapolate
} from 'react-native-reanimated';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
  Layout
} from 'recyclerlistview';
import {
  useRecoilState,
} from 'recoil';
import { numColumnsState } from '../../../store';
import { RecyclerAssetListSection, RecyclerAssetListSectionData, ViewType, GroupHeader } from "../../../types"
import deviceUtils from '../../../utils/deviceUtils'
import { color } from "../../../theme"
import RecyclerSectionItem from "./asset-items/recycler-section-item"
import ExternalScrollView from '../external-scroll-view'
import Cell from '../../../components/PhotoGrid/cell'
import { useColumnsNumber, useScale, usePinching } from '../../../components/PhotoGrid/GridContext';
import { translateOrigin } from '../../../utils/helper'

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
  selectedGroups: { [key: string]: boolean };
  selectedAssets: { [key: string]: boolean };
  selectionMode: boolean;
}
const transition = (
  <Transition.Together >
    <Transition.Change delayMs={0} durationMs={700} interpolation="easeInOut" />
  </Transition.Together>
);
const RecyclerAssetList = ({
  sections,
  numCols,
  scale,
  renderAheadOffset,
  disableAutoScrolling,
  disableRefreshControl,
  scrollHandler,
  scrollRef,
  scrollY,
  ...extras
}: Props): JSX.Element => {
  const transitionRef = useRef();
  const rclRef = useRef<RecyclerListView>();
  const [numColumns] = useColumnsNumber();
  const lastScrollY = useSharedValue(scrollY.value);
  const dyanmicScrollY = useSharedValue(scrollY.value);
  const scale1 = useScale();
  const pinching = usePinching();
  const [cols, setCols] = useState(numCols);
  const [containerSize, setContainerSize] = useState<number[]>(null);
  const [allLayouts, setAllLayouts] = useState<Layout[][]>(null);
  const layoutTransitionRange = useSharedValue<LayoutTransitionRange>(null);
  const visibileIndices = useSharedValue<number[]>(null);
  //const [currentColumns] = useRecoilState(numColumnsState);
  const [currentColumns, setCurrentColumns] = useState(numColumns);
  const [globalDeviceDimensions, setGlobalDeviceDimensions] = useState<number>(0);
  const [extendedState, setExtendedState] = useState<ExtendedState>({
    selectedAssets: {},
    selectedGroups: {},
    selectionMode: false,
  });
  const zoomInStyle = useAnimatedStyle(() => {
    if (!scale)
      return {};

    return {
      height: scale.value !== 1 ? deviceUtils.dimensions.height * 4 : deviceUtils.dimensions.height,
      //width:scale.value>1?deviceUtils.dimensions.width/2:scale.value<1?deviceUtils.dimensions.width*2:deviceUtils.dimensions.width,
      transform: [{
        scale: scale.value
      }, {
        translateX: (
          (
            (
              scale.value * deviceUtils.dimensions.width) -
            deviceUtils.dimensions.width)
          / (2 * scale.value))
      },
      {
        translateY: (
          (
            (
              scale.value * (deviceUtils.dimensions.height * 4 - (StatusBar.currentHeight || 0))
            ) - (deviceUtils.dimensions.height * 4 - (StatusBar.currentHeight || 0))
          )
          / (2 * scale.value))
      }],
      opacity: interpolate(
        scale.value,
        [0, 1, 4],
        [0, 1, 0]
      )
    }
  })
  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      // set globalDeviceDimensions
      const topMargin = nativeEvent.layout.y;
      const additionalPadding = 10;
      setGlobalDeviceDimensions(
        deviceUtils.dimensions.height -
        topMargin -
        additionalPadding
      );
    },
    [setGlobalDeviceDimensions]
  );
  const toggleSelectionMode = () => {
    setExtendedState(prevState => {
      return {
        ...prevState,
        selectedAssets: {},
        selectionMode: !prevState.selectionMode
      }
    });
  };
  const toggleSelection = (section: RecyclerAssetListSection) => {
    setExtendedState(prevState => {
      if (!prevState.selectionMode)
        return prevState;


      if (section.type === ViewType.MONTH) {
        prevState.selectedAssets[section.id] = !prevState.selectedAssets[section.id];
        // TODO: toggle all subgroups
        return {
          ...prevState,
          selectedAssets: { ...prevState.selectedAssets }
        };
      } else if (section.type === ViewType.DAY) {
        const data: GroupHeader = section.data;
        prevState.selectedAssets[section.id] = !prevState.selectedAssets[section.id];
        data.subGroupIds?.forEach(id => {
          if (id !== section.id)
            prevState.selectedAssets[id] = prevState.selectedAssets[section.id];
        });
        return {
          ...prevState,
          selectedAssets: { ...prevState.selectedAssets }
        };
      } else if (section.type === ViewType.ASSET) {
        prevState.selectedAssets[section.id] = !prevState.selectedAssets[section.id];
        return {
          ...prevState,
          selectedAssets: { ...prevState.selectedAssets }
        };
      }
      return prevState;
    });
  }
  const onLongPress = useCallback((section: RecyclerAssetListSection) => {
    toggleSelectionMode();
    toggleSelection(section);
  }, []);
  const onPress = useCallback((section: RecyclerAssetListSection) => {
    toggleSelection(section);
  }, [])
  const rowRenderer = useCallback(
    (type: ViewType, data: RecyclerAssetListSection, index: number, extendedState: ExtendedState): JSX.Element | null => {
      // Checks if value is *nullish*.
      if (data == null || index == null) {
        return null;
      }
      return <RecyclerSectionItem
        section={data}
        selectionMode={extendedState?.selectionMode}
        selected={!!extendedState.selectedAssets[data.id]}
        onLongPress={onLongPress}
        onPress={onPress} />;
    },
    []
  );
  useEffect(() => {
    transitionRef.current?.animateNextTransition();
    setCols(numCols);
  }, [numCols])
  const getLayoutType = useCallback((index) => {
    return sections[index].type
    // if (index === 0) return 'story';
    // else if (data[index]?.deleted) return 'hidden';
    // else if (data[index]?.sortCondition === groupBy || data[index]?.sortCondition === '') {
    //     if (typeof data[index]?.value === 'string') return 'header';
    //     return 'image';
    // }
    // return 'unknown'
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
  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
      (index: number) => sections[index]?.type,
      (type, dim) => {
        const colWidth = Math.floor(deviceUtils.dimensions.width / cols);
        const StoriesHeight = Math.floor(1.618 * deviceUtils.dimensions.width / 3 + 10)
        switch (type) {
          case ViewType.STORY:
            dim.width = deviceUtils.dimensions.width / 3;
            dim.height = StoriesHeight;
            break;
          case ViewType.ASSET:
            dim.width = colWidth;
            dim.height = colWidth;
            break;
          case ViewType.MONTH:
            dim.width = deviceUtils.dimensions.width;
            dim.height = 100;
            break;
          case ViewType.DAY:
            dim.width = deviceUtils.dimensions.width;
            dim.height = 70;
            break;
          default:
            dim.width = deviceUtils.dimensions.width;
            dim.height = 0;
            break;
        }
      }
    );
  }, [
    sections,
    cols
  ]);
  layoutProvider.shouldRefreshWithAnchoring = false;
  const dataProvider = useMemo(() => {
    console.log("dataProvider", sections?.length)
    let provider = new DataProvider(
      (r1: RecyclerAssetListSection, r2: RecyclerAssetListSection) => r1.id !== r2.id,
      index => sections[index]?.id
    );
    provider = provider.cloneWithRows(sections);
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
      pinching={pinching}
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
const styles = StyleSheet.create({
  container: {
    bottom: 0,
    flex: 1,
    height: deviceUtils.dimensions.height,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: deviceUtils.dimensions.width,
  },
});