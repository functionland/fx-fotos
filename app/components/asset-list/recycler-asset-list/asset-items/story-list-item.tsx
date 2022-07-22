import * as React from "react"
import { useNavigation } from "@react-navigation/native"
import { widthPercentageToDP as wp } from "react-native-responsive-screen"
import { Image, FlatList, StyleSheet, Pressable } from "react-native"
import { Text, useTheme } from "@rneui/themed"

import { AssetStory } from "../../../../types"
import { AppNavigationNames } from "../../../../navigators"

interface Props {
  stories: AssetStory[]
}

const StoryListItem = ({ stories }: Props): JSX.Element => {
  const navigation = useNavigation()
  const { theme } = useTheme();

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.flatListContainer}
      keyExtractor={(item) => item.id}
      data={stories}
      renderItem={({ item }) => {
        if (item.data.length === 0) {
          return null
        }

        return (
          <Pressable
            style={styles.container}
            android_ripple={{ color: theme.colors.background, foreground: true }}
            onPress={() =>
              navigation.navigate(AppNavigationNames.HighlightScreen, { highlights: item })
            }
          >
            <Image source={{ uri: item.data[0].uri }} fadeDuration={0} style={styles.image} />
            <Text style={styles.label}>
              {item.title}
            </Text>
          </Pressable>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  flatListContainer:{
    paddingTop:3
  },
  container: {
    width: wp(30),
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  image: { height: "100%", width: "100%", opacity: 0.5 },
  label: { position: "absolute", zIndex: 999, left: 10, bottom: 10 },
  storyIndicatorBar: {
    backgroundColor: "red",
    height: 5,
    marginLeft: 2,
    borderRadius: 100,
  },
})

export default StoryListItem
