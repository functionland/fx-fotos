import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react'
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  ImageErrorEventData,
  ViewStyle,
  RefreshControlProps,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  scrollTo,
  runOnJS,
  useAnimatedReaction,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated'
import { DataProvider, RecyclerListView } from '@functionland/recyclerlistview'
import { Constants } from '../../../theme/constants'
import {
  RecyclerAssetListSection,
  ViewType,
  AssetStory,
  Asset,
} from '../../../types'
import RecyclerSectionItem from './asset-items/recycler-section-item'
import ExternalScrollView from '../external-scroll-view'
import Cell from '../grid-provider/cell'
import {
  useColumnsNumber,
  useScale,
  usePinching,
} from '../grid-provider/gridContext'

import GridLayoutProvider from '../grid-provider/gridLayoutProvider'
import {
  LayoutTransitionRange,
  MIN_COLUMNS,
} from '../grid-provider/gridLayoutManager'
import { ThumbScroll } from '../../index'

export interface Props {
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
  onAssetLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void
  renderFooter?: () => JSX.Element | JSX.Element[]
  onItemPress?: (section: RecyclerAssetListSection) => void
  onStoryPress?: (story: AssetStory) => void
  contentContainerStyle?: ViewStyle
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined
  waitFor?: React.Ref<unknown> | React.Ref<unknown>[] | undefined
  externalState?: Record<string, Asset> | undefined
}

export interface ExtendedState {
  selectedGroups: {
    [key: string]: boolean
  }
  selectedAssets: {
    [key: string]: boolean
  }
  selectionMode: boolean
  externalState?: Record<string, Asset> | undefined
}
export interface RecyclerAssetListHandler {
  resetSelectedItems: () => void
  toggleSelectionMode: () => void
  scrollToItem: (item: RecyclerAssetListSection, animated?: boolean) => void
}
// eslint-disable-next-line react/display-name
const RecyclerAssetList = forwardRef<RecyclerAssetListHandler, Props>(
  (
    {
      sections,
      scrollHandler,
      scrollRef,
      scrollY,
      onSelectedItemsChange,
      onAssetLoadError,
      renderFooter,
      onItemPress,
      onStoryPress,
      contentContainerStyle,
      waitFor,
      refreshControl,
      externalState,
      ...extras
    },
    ref,
  ): JSX.Element => {
    const rclRef = useRef<RecyclerListView>()
    const [numColumns] = useColumnsNumber()
    const lastScrollY = useSharedValue(scrollY.value)
    const scale1 = useScale()
    const pinching = usePinching()
    const [containerSize, setContainerSize] = useState<number[]>(null)
    const layoutTransitionRange = useSharedValue<LayoutTransitionRange>(null)
    const visibileIndices = useSharedValue<number[]>(null)
    const [currentColumns, setCurrentColumns] = useState(numColumns.value)
    const [viewPortHeight, setViewPortHeight] = useState(0)
    const [extendedState, setExtendedState] = useState<ExtendedState>({
      selectedAssets: {},
      selectedGroups: {},
      selectionMode: false,
      externalState: externalState
    })

    useEffect(() => {
      setExtendedState(prev => ({
        ...prev,
        externalState
      }))
    }, [externalState])

    useImperativeHandle(ref, () => ({
      resetSelectedItems: () => {
        setExtendedState(prev => ({
          ...prev,
          selectedAssets: {},
        }))
      },
      toggleSelectionMode: () => {
        toggleSelectionMode()
      },
      scrollToItem: (item: RecyclerAssetListSection, animated = false) => {
        rclRef.current.scrollToItem(item, animated)
      },
    }))
    const toggleSelectionMode = () => {
      setExtendedState(prevState => ({
        ...prevState,
        selectedAssets: {},
        selectionMode: !prevState.selectionMode,
      }))
    }

    const toggleSelection = (section: RecyclerAssetListSection) => {
      setExtendedState(prevState => {
        if (!prevState.selectionMode) return prevState
        let newState = { ...prevState }
        if (section.type === ViewType.MONTH) {
          prevState.selectedAssets[section.id] =
            !prevState.selectedAssets[section.id]
          // TODO: toggle all subgroups
          newState = {
            ...prevState,
            selectedAssets: {
              ...prevState.selectedAssets,
            },
          }
        } else if (section.type === ViewType.DAY) {
          const { data } = section
          prevState.selectedAssets[section.id] =
            !prevState.selectedAssets[section.id]
          data.subGroupIds?.forEach(id => {
            if (id !== section.id)
              prevState.selectedAssets[id] =
                prevState.selectedAssets[section.id]
          })
          newState = {
            ...prevState,
            selectedAssets: {
              ...prevState.selectedAssets,
            },
          }
        } else if (section.type === ViewType.ASSET) {
          prevState.selectedAssets[section.id] =
            !prevState.selectedAssets[section.id]
          newState = {
            ...prevState,
            selectedAssets: {
              ...prevState.selectedAssets,
            },
          }
        }

        if (!Object.values(newState.selectedAssets).includes(true)) {
          return {
            selectedAssets: {},
            selectedGroups: {},
            selectionMode: false,
          }
        }
        return newState
      })
    }

    useEffect(() => {
      if (onSelectedItemsChange) {
        const assetIds = Object.keys(extendedState.selectedAssets).filter(
          key => extendedState.selectedAssets[key],
        )
        onSelectedItemsChange(assetIds, extendedState.selectionMode)
      }
    }, [extendedState])

    const onLongPress = useCallback((section: RecyclerAssetListSection) => {
      toggleSelectionMode()
      toggleSelection(section)
    }, [])

    const onPress = useCallback(
      (section: RecyclerAssetListSection) => {
        if (!extendedState.selectionMode) {
          onItemPress?.(section)
        } else toggleSelection(section)
      },
      [extendedState.selectionMode, onItemPress],
    )

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
            selected={!!extendedState?.selectedAssets[data.id]}
            externalState={extendedState?.externalState?.[data.id]}
            onLongPress={onLongPress}
            onPress={onPress}
            onStoryPress={onStoryPress}
            onAssetLoadError={onAssetLoadError}
          />
        )
      },
      [extendedState, onStoryPress, onPress, onLongPress, onAssetLoadError],
    )

    const getLayoutType = useCallback(index => sections[index].type, [sections])

    const gridLayoutProvider = useMemo(
      () => new GridLayoutProvider(numColumns, scale1, getLayoutType),
      [getLayoutType],
    )
    const renderItemContainer = useCallback(
      (props: any, parentProps: any, children: React.ReactNode) => (
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
      ),
      [gridLayoutProvider],
    )

    gridLayoutProvider.shouldRefreshWithAnchoring = false

    const dataProvider = useMemo(() => {
      console.log('dataProvider', sections?.length)
      let provider = new DataProvider(
        (r1: RecyclerAssetListSection, r2: RecyclerAssetListSection) =>
          r1.id !== r2.id,
      )
      provider = provider.cloneWithRows(sections, 0)
      // provider.getStableId = index => sections[index].id;
      console.log('provider.getSize()', provider.getSize())
      return provider
    }, [sections])

    const animatedReactionWrapper = () => {
      forcRenderRCL()
    }

    useAnimatedReaction(
      () => ({
        pinchingValue: pinching.value,
        numColumnsValue: numColumns.value,
      }),
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
      () => ({
        scaleValue: scale1.value,
        pinchingValue: pinching.value,
      }),
      (next, prev) => {
        if (!next.pinchingValue && !prev?.pinchingValue) return
        if (next.pinchingValue && !prev?.pinchingValue)
          lastScrollY.value = scrollY.value

        if (layoutTransitionRange.value) {
          const extrapolation = {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
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
        extrapolateLeft: Extrapolation.CLAMP,
        extrapolateRight: Extrapolation.CLAMP,
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

    console.log('Render: Recycle-Asset-List', currentColumns, containerSize)

    const forcRenderRCL = () => {
      console.log('forcRenderRCL', numColumns.value)
      rclRef.current?.getVirtualRenderer()?._prepareViewabilityTracker()
      // rclRef.current?._onScroll(0, dyanmicScrollY.value + lastScrollY.value)
      setCurrentColumns(numColumns.value)
    }

    const updateContainerSize = () => {
      const heights = Object.values(
        gridLayoutProvider.getLayoutManager?.()?.getAllContentDimension()
          ?.height || {},
      )
      if (heights?.length) {
        setContainerSize(heights)
      }
    }
    return (
      <View
        style={{ flex: 1 }}
        onLayout={e => {
          setViewPortHeight(e.nativeEvent.layout.height)
        }}
      >
        <ThumbScroll
          scrollY={scrollY}
          hideTimeout={2000}
          headerHeight={Constants.HeaderHeight}
          footerHeight={Constants.TabBarHeight}
          viewPortHeight={viewPortHeight}
          layoutHeight={
            containerSize?.[currentColumns - MIN_COLUMNS] || viewPortHeight
          }
          shouldIndicatorHide={false}
          scrollRef={scrollRef}
          showYearFilter
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
            onLayout: () => {
              updateContainerSize()
            },
            waitFor: waitFor,
            refreshControl: refreshControl,
          }}
          onVisibleIndicesChanged={(all = [], now, notNow) => {
            const visibleIndexValue = all[Math.floor(all?.length / 2)] || 0
            if (!pinching.value && all && all?.length) {
              visibileIndices.value = [...all]
              try {
                layoutTransitionRange.value = gridLayoutProvider
                  .getLayoutManager()
                  ?.getLayoutTransitionRangeForIndex(
                    visibleIndexValue,
                    numColumns.value,
                  )
              } catch (error) {
                console.error(error)
              }
            }
          }}
          stopRenderingOnAnimation={pinching}
          contentContainerStyle={[
            {
              paddingTop: 70,
            },
            contentContainerStyle,
          ]}
          renderItemContainer={renderItemContainer}
          renderContentContainer={(props, children) => (
            <Animated.View
              {...props}
              style={[props.style, containerStyle]}
              onLayout={() => {
                if (!pinching.value) {
                  updateContainerSize()
                }
              }}
            >
              {children}
            </Animated.View>
          )}
          renderFooter={renderFooter}
          {...extras}
        />
      </View>
    )
  },
)
export default RecyclerAssetList
