import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Alert,
  Keyboard,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { Icon, SearchBar, Text, useTheme } from '@rneui/themed'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import { Screen, SearchOptionClip, SearchOptionsList } from '../../components'

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { AssetListScreen } from '../asset-list/asset-list-screen'
import { useFloatHederAnimation } from '../../utils/hooks'
import { Asset, SearchOptionValueType } from '../../types'
import { Assets } from '../../services/localdb'

interface SearchScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<HomeNavigationParamList, HomeNavigationTypes.SearchScreen>
}
export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const keyboardTimer = useRef(0)
  const [medias, setMedias] = useState<Asset[]>([])
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<
    SearchOptionValueType[]
  >([])
  const [scrollY, headerStyles] = useFloatHederAnimation(33)
  const { theme } = useTheme()
  const loadAssets = async () => {
    try {
      if (selectedOptions?.length || searchText) {
        const assets = await Assets.getAll({
          filenameFilter: searchText,
          searchOptions: selectedOptions,
        })
        setMedias(assets)
      } else {
        setMedias([])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      scrollY.value = 0
    }
  }
  useEffect(() => {
    setLoading(true)
    clearTimeout(keyboardTimer.current)
    keyboardTimer.current = setTimeout(() => {
      keyboardTimer.current = 0
      loadAssets()
    }, 300)
  }, [selectedOptions, searchText])

  const renderHeader = (
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>,
  ) => (
    <Animated.View
      style={[
        {
          top: 0,
          position: 'absolute',
          width: '100%',
          zIndex: 99,
          overflow: 'visible',
        },
        headerStyles,
      ]}
    >
      <View style={{ flex: 1 }}>
        <SearchBar
          placeholder="Search asset's name"
          containerStyle={{
            backgroundColor: showSearchOptions
              ? theme.colors.background
              : 'transparent',
            borderTopWidth: 0,
            borderBottomWidth: 0,
          }}
          inputContainerStyle={{ borderRadius: 50 }}
          onChangeText={updateSearch => {
            setSearchText(updateSearch)
            setShowSearchOptions(false)
          }}
          value={searchText}
          showLoading={loading}
          onPressIn={() => setShowSearchOptions(true)}
          searchIcon={{
            iconProps: showSearchOptions
              ? {
                  name: 'arrow-back',
                }
              : {},
            onPress: () => {
              Keyboard.dismiss()
              setShowSearchOptions(!showSearchOptions)
            },
          }}
          theme={theme}
        />
      </View>

      {/* Display selected search option clips */}
      {showSearchOptions || !selectedOptions?.length || (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          style={styles.selectedOptionsContainer}
          exiting={FadeOut}
        >
          {selectedOptions.map(option => (
            <SearchOptionClip
              key={option.id}
              option={option}
              containerStyle={{ marginVertical: 5 }}
              buttonStyle={{
                backgroundColor: theme.colors.grey0,
              }}
              onOptionsPress={removedOption =>
                setSelectedOptions(
                  selectedOptions.filter(item => item.id != removedOption.id),
                )
              }
            />
          ))}
        </Animated.ScrollView>
      )}

      {/* Display search options list */}
      {showSearchOptions && (
        <Animated.View
          entering={FadeIn.duration(100)}
          exiting={FadeOut.duration(300)}
          style={styles.searchOptionsContainer}
        >
          <SearchOptionsList
            style={styles.SearchOptionsList}
            onOptionsPress={option => {
              setShowSearchOptions(false)
              setSelectedOptions([...selectedOptions, option])
            }}
            selectedOptions={selectedOptions}
          />
        </Animated.View>
      )}
    </Animated.View>
  )
  const renderSearchPlaceHolder = () =>
    !medias.length &&
    !searchText &&
    !selectedOptions.length &&
    !loading && (
      <View style={styles.placeholderContainer}>
        <Icon name="image-search" size={80} />
        <Text h4 style={styles.placeholderText}>
          Find your assets
        </Text>
      </View>
    )
  const renderNotfoundPlaceHolder = () =>
    (!!searchText || selectedOptions.length > 0) &&
    !medias?.length &&
    !loading && (
      <View style={styles.placeholderContainer}>
        <Icon type="material-community" name="emoticon-sad-outline" size={60} />
        <Text h4 style={styles.placeholderText}>
          Nothing found!
        </Text>
      </View>
    )
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <View style={styles.container}>
        {renderHeader()}
        {renderSearchPlaceHolder()}
        {renderNotfoundPlaceHolder()}
        {medias?.length > 0 && (
          <AssetListScreen
            navigation={navigation}
            medias={medias}
            defaultHeader={() => true}
            externalScrollY={scrollY}
            contentContainerStyle={styles.assetListScreenContainer}
          />
        )}
      </View>
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  assetListScreenContainer: {
    paddingTop: 80,
  },
  selectedOptionsContainer: {
    width: '100%',
    padding: 0,
    paddingHorizontal: 10,
  },
  searchOptionsContainer: {
    flex: 1,
    height: 8000,
    zIndex: 99,
  },
  SearchOptionsList: {
    paddingHorizontal: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    padding: 10,
  },
})
