import * as React from 'react'
import { useCallback } from 'react'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { Image, FlatList, StyleSheet, Pressable } from 'react-native'
import { Text, useTheme } from '@rneui/themed'
import { SharedElement } from 'react-navigation-shared-element'
import { AssetStory } from '../../../../types'

interface Props {
  stories: AssetStory[]
  onPress?: (story: AssetStory) => void
}

// eslint-disable-next-line no-undef
function StoryListItem({ stories, onPress }: Props): JSX.Element {
  const { theme } = useTheme()
  const renderItem = useCallback(
    ({ item }) => {
      if (item.data.length === 0) {
        return null
      }
      const onItemPress = () => {
        onPress?.(item)
      }
      return (
        <Pressable
          style={styles.container}
          android_ripple={{
            color: theme.colors.background,
            foreground: true,
          }}
          onPress={onItemPress}
        >
          <SharedElement id={item.id}>
            <Image
              source={{
                uri: item.data[0].uri,
              }}
              fadeDuration={0}
              style={styles.image}
            />
          </SharedElement>
          <Text style={styles.label}>{item.title}</Text>
        </Pressable>
      )
    },
    [onPress, theme],
  )
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.flatListContainer}
      keyExtractor={item => item.id}
      data={stories}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  flatListContainer: {
    paddingTop: 3,
  },
  container: {
    width: wp(30),
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  image: {
    height: '100%',
    width: '100%',
    opacity: 0.5,
  },
  label: {
    position: 'absolute',
    zIndex: 999,
    left: 10,
    bottom: 10,
  },
  storyIndicatorBar: {
    backgroundColor: 'red',
    height: 5,
    marginLeft: 2,
    borderRadius: 100,
  },
})

export default StoryListItem
