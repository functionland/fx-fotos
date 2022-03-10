
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
  useAnimatedReaction
} from 'react-native-reanimated';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
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

import GridLayoutProvider from '../../../components/PhotoGrid/GridLayoutProvider'
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
  const timerRef = useRef<number>();
  const [numColumns] = useColumnsNumber();
  const lastScrollY = useSharedValue(scrollY.value);
  const dyanmicScrollY = useSharedValue(scrollY.value);
  const visibleIndex = useSharedValue(0);
  const visibleIndexs = useRef<{ all: number[], notNow: number[], now: number[] }>({ all: [], notNow: [], now: [] });
  const scale1 = useScale();
  const pinching = usePinching();
  const [cols, setCols] = useState(numCols);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState();
  //const [currentColumns] = useRecoilState(numColumnsState);
  const [currentColumns,setCurrentColumns]=useState(numColumns);
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
      <Cell {...props} visibleIndex={visibleIndex} pinching={pinching} dynamicScrollY={dyanmicScrollY} lastScrollY={lastScrollY} scale={scale1} columnNumber={numColumns.value} layoutProvider={gridLayoutProvider} index={parentProps.index}>
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
  const onScaleChange = (value) => {
    //const layouts = gridLayoutProvider.getLayoutManager()?.getContentDimension();
    //scrollTo(scrollRef,0,scale1.value,true);
  }
  // useDerivedValue(() => {
  //   const s=scale1.value;
  //   runOnJS(onScaleChange)(scale1.value-Math.floor(scale1.value));
  //   if(scale1.value-Math.floor(scale1.value)!==0)
  //     scrollTo(scrollRef,0,scrollY.value +  100*(scale1.value-Math.floor(scale1.value)),false);
  // },[scale1])
  const animatedReactionWrapper = () => {
    forcRenderRCL();
  };
  useAnimatedReaction(() => {
    return { pinchingValue: pinching.value, numColumnsValue: numColumns.value, scaleValue: scale1.value };
  }, (next, prev) => {
    if (next.pinchingValue && !prev?.pinchingValue) {
      lastScrollY.value = scrollY.value;
      dyanmicScrollY.value = 0;
    } else if (!next.pinchingValue && prev?.pinchingValue && next.numColumnsValue !== prev.numColumnsValue) {
      console.log("pinchingValue runOnJS", prev?.pinchingValue, next.pinchingValue,  prev?.numColumnsValue, next.numColumnsValue,prev?.scaleValue, next.scaleValue, )
      runOnJS(animatedReactionWrapper)();
      //numColumns.value = next.scaleValue;
    } else if (!next.pinchingValue && prev?.pinchingValue && next.numColumnsValue === next.scaleValue) {
      console.log("pinchingValue scrollTo", prev?.pinchingValue, next.pinchingValue,  prev?.numColumnsValue, next.numColumnsValue,prev?.scaleValue, next.scaleValue, )
      scrollTo?.(scrollRef, 0, lastScrollY.value, false)
    }
  });
  useAnimatedReaction(
    () => {
      return { scrolling: dyanmicScrollY.value }
    },
    (next) => {
      if (pinching.value && scale1.value !== Math.floor(scale1.value)) {
        //console.log("scrolling", next.scrolling)
        scrollTo?.(scrollRef, 0, next.scrolling + lastScrollY.value, false)
      }
    }
  );
  const containerStyle = useAnimatedStyle(() => {
    if (!containerSize)
      return {};
    const scaleCeil = Math.ceil(scale1.value)
    const scaleFloor = Math.floor(scale1.value)
    let style = {}
    if (numColumns.value >= scale1.value) {
      style = {
        height: interpolate(scale1.value, [scaleFloor, numColumns.value], [containerSize.height[scaleFloor], containerSize.height[numColumns.value]])
      }
    }
    else if (numColumns.value < scale1.value) {
      style = {
        height: interpolate(scale1.value, [numColumns.value, scaleCeil], [containerSize.height[numColumns.value], containerSize.height[scaleCeil]])
      }
    }
    //console.log("containerStyle",style.height,scale1.value,pinching?.value)
    return style;
  }, [containerSize])
  // useEffect(() => {
  //     forcRenderRCL();
  // }, [currentColumns])
  console.log("Render: Recycle-Asset-List")
  const forcRenderRCL = () => {
    clearTimeout(timerRef.current)
    console.log("forcRenderRCL", timerRef.current,numColumns.value);
    rclRef.current?.getVirtualRenderer()?._updateRenderStack(visibleIndexs.current.all);
    rclRef.current?.getVirtualRenderer()?._onEngagedItemsChanged([],visibleIndexs.current.all,[]);
    rclRef.current?.getVirtualRenderer()?._prepareViewabilityTracker();
    rclRef.current?._onScroll(0,dyanmicScrollY.value+lastScrollY.value)

    //rclRef.current?._checkAndChangeLayouts(rclRef.current.props, false);
    timerRef.current = setTimeout(() => {
      //setCurrentColumns(numColumns.value)
      timerRef.current = 0;

      //getVirtualRenderer()?.refresh();
      //._refreshViewability()
      //._checkAndChangeLayouts(rclRef.current.props, true);
    }, 0);
  }
  return (
    <RecyclerListView
      ref={rclRef}
      dataProvider={dataProvider}
      extendedState={extendedState}
      layoutProvider={gridLayoutProvider}
      //renderAheadOffset={1000}
      //renderAheadOffset={renderAheadOffset}
      rowRenderer={rowRenderer}
      externalScrollView={ExternalScrollView}
      scrollViewProps={{
        scrollRefExternal: scrollRef,
        _onScrollExternal: scrollHandler,
        onContentSizeChange: (contentWidth, contentHeight) => {
          if (!pinching.value) {
            //forcRenderRCL();
          }
        }
      }}
      onVisibleIndicesChanged={(all, now, notNow) => {
        if (!pinching.value && all) {
          visibleIndexs.current.all = all;
          visibleIndexs.current.now = now;
          visibleIndexs.current.notNow = notNow;
          visibleIndex.value = all[Math.floor(all.length / 2)];
        }
      }}
      pinching={pinching}
      contentContainerStyle={{ paddingTop: 50 }}
      renderItemContainer={renderItemContainer}
      renderContentContainer={(props, children) => {
        return (
          <Animated.View {...props} style={[props.style, containerStyle]} onLayout={(event: LayoutChangeEvent) => {
            if (!containerSize) {
              const heights = gridLayoutProvider?.getLayoutManager?.()?.getAllContentDimension()
              setContainerSize(heights);
            } else if (!pinching.value) {
              console.log("onLayout", event.nativeEvent.layout.height)
              // forcRenderRCL();
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