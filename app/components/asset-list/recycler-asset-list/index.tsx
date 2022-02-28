import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  StatusBar,
  NativeSyntheticEvent,
  View,
  NativeScrollEvent,
  ScrollViewProps,
  LayoutChangeEvent,
  StyleSheet,
  Platform,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Transitioning,
  Transition,
} from "react-native-reanimated"
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview"
import {
  RecyclerAssetListSection,
  RecyclerAssetListSectionData,
  ViewType,
  GroupHeader,
} from "../../../types"
import deviceUtils from "../../../utils/deviceUtils"
import { color } from "../../../theme"
import RecyclerSectionItem from "./asset-items/recycler-section-item"
import ExternalScrollView from "../external-scroll-view"
import { HomeNavigation, HomeNavigationTypes } from "../../../navigators/HomeNavigation"

export interface Props {
  sections: RecyclerAssetListSection[]
  numCols: 2 | 3 | 4 | 5
  scale?: SharedValue<number>
  renderAheadOffset?: number
  disableAutoScrolling?: boolean
  disableRefreshControl?: boolean
  scrollRef?: any
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

export interface ExtendedState {
  selectedGroups: { [key: string]: boolean }
  selectedAssets: { [key: string]: boolean }
  selectionMode: boolean
}
const transition = (
  <Transition.Together>
    <Transition.Change delayMs={0} durationMs={700} interpolation="easeInOut" />
  </Transition.Together>
)
const RecyclerAssetList = ({
  navigation,
  sections,
  numCols,
  scale,
  renderAheadOffset,
  disableAutoScrolling,
  disableRefreshControl,
  scrollHandler,
  scrollRef,
  ...extras
}: Props): JSX.Element => {
  const transitionRef = useRef()
  const [cols, setCols] = useState(numCols)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [globalDeviceDimensions, setGlobalDeviceDimensions] = useState<number>(0)
  const [extendedState, setExtendedState] = useState<ExtendedState>({
    selectedAssets: {},
    selectedGroups: {},
    selectionMode: false,
  })
  const zoomInStyle = useAnimatedStyle(() => {
    if (!scale) return {}

    return {
      height: scale.value !== 1 ? deviceUtils.dimensions.height * 4 : deviceUtils.dimensions.height,
      //width:scale.value>1?deviceUtils.dimensions.width/2:scale.value<1?deviceUtils.dimensions.width*2:deviceUtils.dimensions.width,
      transform: [
        {
          scale: scale.value,
        },
        {
          translateX:
            (scale.value * deviceUtils.dimensions.width - deviceUtils.dimensions.width) /
            (2 * scale.value),
        },
        {
          translateY:
            (scale.value * (deviceUtils.dimensions.height * 4 - (StatusBar.currentHeight || 0)) -
              (deviceUtils.dimensions.height * 4 - (StatusBar.currentHeight || 0))) /
            (2 * scale.value),
        },
      ],
      opacity: interpolate(scale.value, [0, 1, 4], [0, 1, 0]),
    }
  })
  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      // set globalDeviceDimensions
      const topMargin = nativeEvent.layout.y
      const additionalPadding = 10
      setGlobalDeviceDimensions(deviceUtils.dimensions.height - topMargin - additionalPadding)
    },
    [setGlobalDeviceDimensions],
  )
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
    [],
  )
  useEffect(() => {
    transitionRef.current?.animateNextTransition()
    setCols(numCols)
  }, [numCols])
  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
      (index: number) => sections[index]?.type,
      (type, dim) => {
        const colWidth = Math.floor(deviceUtils.dimensions.width / cols)
        const StoriesHeight = Math.floor((1.618 * deviceUtils.dimensions.width) / 3 + 10)
        switch (type) {
          case ViewType.STORY:
            dim.width = deviceUtils.dimensions.width / 3
            dim.height = StoriesHeight
            break
          case ViewType.ASSET:
            dim.width = colWidth
            dim.height = colWidth
            break
          case ViewType.MONTH:
            dim.width = deviceUtils.dimensions.width
            dim.height = 100
            break
          case ViewType.DAY:
            dim.width = deviceUtils.dimensions.width
            dim.height = 70
            break
          default:
            dim.width = deviceUtils.dimensions.width
            dim.height = 0
            break
        }
      },
    )
  }, [sections, cols])
  layoutProvider.shouldRefreshWithAnchoring = false
  const dataProvider = useMemo(() => {
    console.log("dataProvider", sections?.length)
    let provider = new DataProvider(
      (r1: RecyclerAssetListSection, r2: RecyclerAssetListSection) => r1.id !== r2.id,
      (index) => sections[index]?.id,
    )
    provider = provider.cloneWithRows(sections)
    // provider.getStableId = index => sections[index].id;
    console.log("provider.getSize()", provider.getSize())
    return provider
  }, [sections])
  return (
    <Animated.View style={[zoomInStyle, styles.container]} collapsable={false} onLayout={onLayout}>
      <RecyclerListView
        dataProvider={dataProvider}
        extendedState={extendedState}
        layoutProvider={layoutProvider}
        renderAheadOffset={renderAheadOffset}
        rowRenderer={rowRenderer}
        externalScrollView={ExternalScrollView}
        scrollViewProps={{
          scrollRefExternal: scrollRef,
          _onScrollExternal: scrollHandler,
        }}
        contentContainerStyle={{ paddingTop: 50 }}
        renderContentContainer={(props, children) => {
          return (
            <Transitioning.View ref={transitionRef} transition={transition} {...props}>
              {children}
            </Transitioning.View>
          )
        }}
        {...extras}
      />
    </Animated.View>
  )
}
export default RecyclerAssetList
const styles = StyleSheet.create({
  container: {
    bottom: 0,
    flex: 1,
    height: deviceUtils.dimensions.height,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: deviceUtils.dimensions.width,
  },
})
