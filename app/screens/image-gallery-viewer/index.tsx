import { NavigationProp, RouteProp } from "@react-navigation/native"
import React, { useState, useRef } from "react"
import { StyleSheet } from "react-native"
import { FlatList, NativeViewGestureHandler } from "react-native-gesture-handler"
import { Screen } from "../../components"
import { RootStackParamList } from "../../navigators"
import { GalleryImage } from "./gallery-image"

interface ImageGalleryViewerScreenProps {
  navigation: NavigationProp<RootStackParamList>
  route: RouteProp<RootStackParamList, "ImageGalleryViewer">
}

export const ImageGalleryViewerScreen: React.FC<ImageGalleryViewerScreenProps> = ({ route }) => {
  const { medias, assetId } = route.params
  const [currentIndex, setCurrentIndex] = useState(null)
  if (currentIndex === null) {
    medias.forEach((asset, idx) => {
      if (asset.id === assetId) {
        setCurrentIndex(idx)
      }
    })
  }

  const listRef = useRef()
  const listGestureRef = useRef()

  const renderItem = ({ item }) => {
    return <GalleryImage asset={item} listRef={listRef} listGestureRef={listGestureRef} />
  }

  return (
    <Screen style={styles.screen} backgroundColor={"black"} statusBar={"dark-content"}>
      <NativeViewGestureHandler ref={listGestureRef} >
        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={medias}
          initialScrollIndex={currentIndex}
          horizontal={true}
          pagingEnabled
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
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
