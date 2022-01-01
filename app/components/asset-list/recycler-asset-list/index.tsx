
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { NativeSyntheticEvent, View, NativeScrollEvent, ScrollViewProps, LayoutChangeEvent, StyleSheet, Platform } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from 'recyclerlistview';
import { RecyclerAssetListSection, RecyclerAssetListSectionData, ViewType, GroupHeader } from "../../../types"
import deviceUtils from '../../../utils/deviceUtils'
import { color } from "../../../theme"
import RecyclerSectionItem from "./asset-items/recycler-section-item"
import ExternalScrollView from '../external-scroll-view'

export interface Props {
  sections: RecyclerAssetListSection[];
  numCols: 2 | 3 | 4 | 5;
  renderAheadOffset?: number;
  disableAutoScrolling?: boolean;
  disableRefreshControl?: boolean;
  scrollRef?:any,
  scrollHandler:(event: NativeSyntheticEvent<NativeScrollEvent>) => void
};

export interface ExtendedState {
  selectedGroups: { [key: string]: boolean };
  selectedAssets: { [key: string]: boolean };
  selectionMode: boolean;
}
const RecyclerAssetList = ({
  //refreshData,
  sections,
  numCols,
  renderAheadOffset,
  disableAutoScrolling,
  disableRefreshControl,
  scrollHandler,
  scrollRef,
  ...extras
}: Props): JSX.Element => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [globalDeviceDimensions, setGlobalDeviceDimensions] = useState<number>(0);
  const [extendedState, setExtendedState] = useState<ExtendedState>({
    selectedAssets: {},
    selectedGroups: {},
    selectionMode: false
  });
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
          if(id!==section.id)
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

  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
      (index: number) => sections[index]?.type,
      (type, dim) => {
        const colWidth = Math.floor(deviceUtils.dimensions.width / numCols);
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
    numCols
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
  return (
    <View style={styles.container} onLayout={onLayout}>
      <RecyclerListView
        dataProvider={dataProvider}
        extendedState={extendedState}
        layoutProvider={layoutProvider}
        renderAheadOffset={renderAheadOffset}
        rowRenderer={rowRenderer}
        externalScrollView={ExternalScrollView}
        scrollViewProps={{
          scrollRefExternal:scrollRef,
          _onScrollExternal:scrollHandler,
        }}
        contentContainerStyle={{paddingTop:50}}
        {...extras}
      />
    </View>
  );
}
export default RecyclerAssetList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});