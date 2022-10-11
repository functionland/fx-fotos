import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Alert,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { useRecoilState } from 'recoil'
import { request, PERMISSIONS, openSettings } from 'react-native-permissions'
import { Input, SearchBar } from '@rneui/themed'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AssetService } from '../../services'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { mediasState } from '../../store'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import {
  Header,
  Screen,
  SearchOptionClip,
  SearchOptionsList,
} from '../../components'
import AssetList from '../../components/asset-list'
import Animated, {
  FadeIn,
  FadeOut,
  SlideOutDown,
  SlideOutUp,
} from 'react-native-reanimated'
import { AssetListScreen } from '../asset-list/asset-list-screen'
import { useFloatHederAnimation } from '../../utils/hooks'
import { Asset, SearchOptionValueType } from '../../types'
import { ScrollView } from 'react-native-gesture-handler'
import { Assets } from '../../services/localdb'

interface SearchScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<HomeNavigationParamList, HomeNavigationTypes.SearchScreen>
}
export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [medias, setMedias] = useState<Asset[]>([])
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<
    SearchOptionValueType[]
  >([])
  const [scrollY, headerStyles] = useFloatHederAnimation(43)

  const loadAssets = async () => {
    try {
      console.log('loadAssets', selectedOptions)
      if (selectedOptions?.length || searchText) {
        const assets = await Assets.getAll({
          filenameFilter: searchText,
          searchOptions: selectedOptions,
        })
        console.log('loadAssets assets', assets?.[0])

        setMedias(assets)
      } else {
        setMedias([])
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    loadAssets()
  }, [selectedOptions, searchText])

  const renderHeader = (
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>,
  ) => (
    <Animated.View
      style={[
        {
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
          style={{ borderWidth: 0 }}
          placeholder="Search assets ..."
          containerStyle={{ backgroundColor: 'black', borderWidth: 0 }}
          inputContainerStyle={{ borderRadius: 50 }}
          onChangeText={updateSearch => {
            setSearchText(updateSearch)
            setShowSearchOptions(false)
          }}
          value={searchText}
          onFocus={() => setShowSearchOptions(true)}
          onClear={() => {
            setSearchText('')
            loadAssets()
          }}
        />
      </View>

      {/* Display selected search option clips */}
      {showSearchOptions || !selectedOptions?.length || (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          style={{
            width: '100%',
            //height: ,
            padding: 0,
            paddingHorizontal:10
          }}
          exiting={FadeOut}
        >
          {selectedOptions.map(option => (
            <SearchOptionClip
              key={option.id}
              option={option}
              containerStyle={{ marginVertical: 5 }}
              buttonStyle={{
                backgroundColor: 'gray',
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
          style={{ flex: 1, height: 800, zIndex: 99 }}
        >
          <SearchOptionsList
            style={{ paddingHorizontal: 10 }}
            onOptionsPress={option => {
              setShowSearchOptions(false)
              setSelectedOptions([...selectedOptions, option])
            }}
          />
        </Animated.View>
      )}
    </Animated.View>
  )
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <View style={{ flex: 1 }}>
        {renderHeader()}
        <AssetListScreen
          navigation={navigation}
          medias={medias}
          defaultHeader={() => <View></View>}
          externalScrollY={scrollY}
          contentContainerStyle={{ paddingTop: 80 }}
        />
      </View>
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
})
