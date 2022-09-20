import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  ListRenderItemInfo,
  Pressable,
  Image,
} from 'react-native'
import { useRecoilState } from 'recoil'
import { Icon, Text, useTheme } from '@rneui/themed'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { FlatList } from 'react-native-gesture-handler'
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated'
import { Screen } from '../../components'
import { AssetService } from '../../services'
import { Library } from '../../types'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { mediasState, selectedLibraryState } from '../../store'
import { Header, HeaderLogo } from '../../components/header'
import { Constants } from '../../theme'
import { useFloatHederAnimation } from '../../utils/hooks'
import { AppNavigationNames } from '../../navigators'

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<
    HomeNavigationParamList,
    HomeNavigationTypes
  >
}
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
export const LibraryScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [medias] = useRecoilState(mediasState)
  const [selectedLibrary, setSelectedLibrary] =
    useRecoilState(selectedLibraryState)
  const { theme } = useTheme()
  const [libraies, setLibraries] = useState<Library[]>(null)
  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
  useEffect(() => {
    const libs = AssetService.getLibraries(medias)
    setLibraries(libs)
    if (selectedLibrary) {
      const lib = libs.find(lib => lib.title === selectedLibrary.title)
      if (lib) setSelectedLibrary(lib)
    }
  }, [medias])
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      if (scrollY) scrollY.value = event.contentOffset.y
    },
  })
  const renderHeader = () => (
    <Header style={headerStyles} centerComponent={<HeaderLogo />} />
  )

  const onLibraryPress = (item: Library) => {
    setSelectedLibrary(item)
    navigation.push(AppNavigationNames.LibraryAssets)
  }

  const renderItem = (info: ListRenderItemInfo<Library>) => (
    <View style={styles.card}>
      <Pressable
        android_ripple={{
          color: theme.colors.background,
          foreground: true,
        }}
        onPress={() => onLibraryPress(info.item)}
      >
        <Image
          style={styles.cardImage}
          source={{
            uri: info.item?.assets?.[0]?.uri,
          }}
          resizeMode="cover"
        />
      </Pressable>
      <Text>{info.item.title}</Text>
    </View>
  )
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
      {libraies && (
        <AnimatedFlatList
          contentContainerStyle={styles.listContainer}
          style={{ flex: 1 }}
          data={libraies}
          numColumns={2}
          renderItem={renderItem}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    paddingTop: Constants.HeaderHeight,
    paddingHorizontal: 5,
  },
  card: {
    flex: 1,
    padding: 10,
  },
  cardImage: {
    aspectRatio: 1,
    width: '100%',
    flex: 1,
    marginBottom: 8,
    borderRadius: 15,
  },
})
