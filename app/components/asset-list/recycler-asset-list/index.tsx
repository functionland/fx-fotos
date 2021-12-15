
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, RefreshControl, ScrollViewProps, LayoutChangeEvent, StyleSheet, Platform } from "react-native"
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from 'recyclerlistview';
import { RecyclerAssetListSection, ViewType } from "../../../types"
import deviceUtils from '../../../utils/deviceUtils'
import { color } from "../../../theme"
import RecyclerSectionItem from "./recycler-section-item"

export interface Props {
  refreshData: () => Promise<void>;
  sections: RecyclerAssetListSection[];
  numCols: 2 | 3 | 4 | 5;
  renderAheadOffset?: number;
  disableAutoScrolling?: boolean;
  disableRefreshControl?: boolean;
};


const RecyclerAssetList = ({
  refreshData,
  sections,
  numCols,
  renderAheadOffset,
  disableAutoScrolling,
  disableRefreshControl,
  ...extras
}: Props): JSX.Element => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [globalDeviceDimensions, setGlobalDeviceDimensions] = useState<number>(0);
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !refreshData) {
      return;
    }
    try {
      setIsRefreshing(true);
      setIsBlockingUpdate(true);
      await refreshData();
    } catch (e) {
      //logger.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshData]);
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


  const onScroll = useCallback(
    (e: unknown, f: unknown, offsetY: number) => {
      // TODO: use to manage sticky header
    },
    []
  );

  const rowRenderer = useCallback(
    (type: ViewType, data: RecyclerAssetListSection, index: number): JSX.Element | null => {
      // Checks if value is *nullish*.
      if (data == null || index == null) {
        return null;
      }
      return <RecyclerSectionItem section={data}/>;
    },
    []
  );

  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
      // The LayoutProvider expects us to return ReactText, however internally
      // we use custom layout description objects, so we can ignore this error.
      // @ts-ignore
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
            dim.height = 50;
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
    console.log("dataProvider",sections?.length)
    let provider = new DataProvider(
      (r1:RecyclerAssetListSection, r2:RecyclerAssetListSection) => r1.data.id !== r2.data.id,
      index => sections[index]?.data?.id
    );
    provider=provider.cloneWithRows(sections);
    //provider.getStableId = index => sections[index].id;
    console.log("provider.getSize()",provider.getSize())
    return provider;
  }, [sections]);
  const scrollViewProps = useMemo(
    (): Partial<ScrollViewProps> =>
      disableRefreshControl
        ? {}
        : {
          refreshControl: (
            <RefreshControl
              onRefresh={handleRefresh}
              progressViewOffset={Platform.OS==="android" ? 30 : 0}
              refreshing={isRefreshing}
              tintColor={color.primary}
            />
          ),
        },
    [handleRefresh, isRefreshing]
  );

  return (
    <View style={styles.container} onLayout={onLayout}>
      <RecyclerListView
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        onScroll={onScroll}
        renderAheadOffset={renderAheadOffset}
        rowRenderer={rowRenderer}
        scrollViewProps={scrollViewProps}
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