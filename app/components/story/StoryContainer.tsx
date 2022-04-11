import React from "react"
import { useRecoilValue } from "recoil"
import { View, StyleSheet, FlatList, Image, Text } from "react-native"

import { mediasState } from "../../store"
import { Constants, palette } from "../../theme"
import { categorizeAssets } from "../../services"
import { RecyclerAssetListSection } from "../../types"

export const StoryContainer = () => {
  const photos = useRecoilValue(mediasState)
  const [stories, setStories] = React.useState([])
  const [categorizedAssets, setCategorizedAssets] = React.useState<
    undefined | RecyclerAssetListSection[]
  >(undefined)

  const categorizeStories = React.useCallback(() => {
    const indexes = []
    categorizedAssets.map((item, index) => {
      if (item.data.title) indexes.push(index)
    })

    indexes.map((item, index) => {
      const storyObj = { stories: undefined, title: undefined }
      storyObj.stories = categorizedAssets.slice(item + 1, indexes[index + 1])
      storyObj.title = categorizedAssets[item]

      setStories((prev) => {
        return [...prev, storyObj]
      })
    })
  }, [categorizeAssets])

  React.useEffect(() => {
    const assets = categorizeAssets(photos)
    setCategorizedAssets(assets)
  }, [photos])

  React.useEffect(() => {
    if (!categorizedAssets) return
    categorizeStories()
  }, [categorizeAssets])

  return (
    <View style={styles.wrapper}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 5 }} />}
        data={stories}
        renderItem={({ item, index }) => {
          if (item.stories.length === 0) return null

          return (
            <>
              <Text style={[styles.date, { marginLeft: index === 0 ? 10 : 0 }]}>
                {item.title.data.title.split(",").slice(0, 2)}
              </Text>
              <View style={[styles.activityItem, { marginLeft: index === 0 ? 10 : 0 }]}>
                <Image style={styles.image} source={{ uri: item.stories[0].data.uri }} />
              </View>
            </>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: Constants.StoryWrapperHeight,
  },
  activityItem: {
    opacity: 0.5,
    height: "100%",
    width: Constants.StoryItemWidth,
    backgroundColor: palette.lighterGrey,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    resizeMode: "cover",
    height: "100%",
    width: "100%",
  },
  separator: { width: 5 },
  date: {
    paddingLeft: 5,
    paddingTop: 8,
    position: "absolute",
    zIndex: 10000,
  },
})
