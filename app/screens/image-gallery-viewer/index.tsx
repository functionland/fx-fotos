import { NavigationProp, RouteProp } from "@react-navigation/native"
import { DataProvider, GridLayoutProvider, RecyclerListView } from "fula-recyclerlistview"
import React, { useState, useRef, useMemo } from "react"
import { useWindowDimensions } from "react-native"
import { StyleSheet } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"
import { Screen } from "../../components"
import { RootStackParamList } from "../../navigators"
import { Asset } from "../../types"
import { GalleryImage } from "./gallery-image"

interface ImageGalleryViewerScreenProps {
  navigation: NavigationProp<RootStackParamList>
  route: RouteProp<RootStackParamList, "ImageGalleryViewer">
}

export const ImageGalleryViewerScreen: React.FC<ImageGalleryViewerScreenProps> = ({ route }) => {
  const { medias, assetId } = route.params
  const windowDims = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  if (currentIndex === null) {
    medias.forEach((asset, idx) => {
      if (asset.id === assetId) {
        setCurrentIndex(idx)
      }
    })
  }

  const listGestureRef = useRef()

  const renderItem = ({ item }) => {
    return (
      <GalleryImage
        asset={item}
        enableParentScroll={enableScroll}
        disableParentScroll={disableScroll}
        listGestureRef={listGestureRef}
      />
    )
  }

  const rowRenderer = (type: string | number, data: Asset) => {
    return renderItem({ item: data })
  }

  const layoutProvider = useMemo(() => {
    return new GridLayoutProvider(
      1,
      () => "PHOTO",
      () => 1,
      () => windowDims.width,
    )
  }, [windowDims])

  const dataProvider = useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1.id !== r2.id)
    provider = provider.cloneWithRows(medias, 0)
    return provider
  }, [])

  const enableScroll = () => {
    setScrollEnabled(true)
  }

  const disableScroll = () => {
    setScrollEnabled(false)
  }

  return (
    <Screen
      style={styles.screen}
      preset={"fixed"}
      unsafe={true}
      backgroundColor={"black"}
      statusBar={"dark-content"}
    >
      <NativeViewGestureHandler ref={listGestureRef}>
        <RecyclerListView
          isHorizontal={true}
          initialRenderIndex={currentIndex}
          style={{ flex: 1 }}
          layoutProvider={layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={rowRenderer}
          renderAheadOffset={5}
          scrollViewProps={{
            scrollEnabled: scrollEnabled,
            pagingEnabled: true,
            showsHorizontalScrollIndicator: false,
            showsVerticalScrollIndicator: false,
          }}
        />
      </NativeViewGestureHandler>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
})
