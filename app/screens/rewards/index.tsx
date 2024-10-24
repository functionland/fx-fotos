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

interface RewardsScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<HomeNavigationParamList, HomeNavigationTypes.SearchScreen>
}
export const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
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
