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
import { Header, Screen, SearchOptionsList } from '../../components'
import AssetList from '../../components/asset-list'
import Animated, {
  FadeIn,
  FadeOut,
  SlideOutDown,
  SlideOutUp,
} from 'react-native-reanimated'
import { AssetListScreen } from '../asset-list/asset-list-screen'
import { useFloatHederAnimation } from '../../utils/hooks'

interface SearchScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<HomeNavigationParamList, HomeNavigationTypes.SearchScreen>
}
export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [medias] = useRecoilState(mediasState)
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
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
          //   onChangeText={updateSearch}
          //   value={search}
          onFocus={() => setShowSearchOptions(true)}
        />
      </View>
      {showSearchOptions && (
        <Animated.View
          entering={FadeIn.duration(100)}
          exiting={FadeOut.duration(300)}
          style={{ flex: 1, height: 800, zIndex: 99 }}
        >
          <SearchOptionsList
            style={{ paddingHorizontal: 10 }}
            onOptionsPress={() => setShowSearchOptions(false)}
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
