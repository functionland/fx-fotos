import * as React from "react"
import * as dateFns from "date-fns"
import { useNavigation } from "@react-navigation/native"
import { widthPercentageToDP as wp } from "react-native-responsive-screen"
import { Image, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native"

import { AssetStory } from "../../../../types"
import { AppNavigationNames } from "../../../../navigators"

interface Props {
  stories: AssetStory[]
}

const TODAY = new Date()
const StoryListItem = ({ stories }: Props): JSX.Element => {
  const navigation = useNavigation()
  return (
    <FlatList
      horizontal
      keyExtractor={(item) => item.id + Math.random() * 16}
      data={stories}
      renderItem={({ item }) => {
        if (item.data.length === 0) {
          return null
        }

        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(AppNavigationNames.HighlightScreen, { highlights: item })
            }
            style={styles.container}
          >
            <Text style={styles.label}>
              {dateFns.isSameMonth(new Date(item.id), TODAY)
                ? "Recent"
                : dateFns.formatDistanceToNow(new Date(item.id)) + " ago"}
            </Text>
            <Image source={{ uri: item.data[0].uri }} style={styles.image} />
          </TouchableOpacity>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    width: wp(45),
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  image: { height: "100%", width: "100%", opacity: 0.5 },
  label: { position: "absolute", zIndex: 999, left: 5, top: 5 },
  storyIndicatorBar: {
    backgroundColor: "red",
    height: 5,
    marginLeft: 2,
    borderRadius: 100,
  },
})

export default StoryListItem
