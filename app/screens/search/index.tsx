import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, Platform, StyleSheet, View } from 'react-native'
import { useRecoilState } from 'recoil'
import { request, PERMISSIONS, openSettings } from 'react-native-permissions'
import { SearchBar } from '@rneui/themed'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AssetService } from '../../services'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { mediasState } from '../../store'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import { Screen, SearchOptionsList } from '../../components'
import AssetList from '../../components/asset-list'

interface SearchScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<HomeNavigationParamList, HomeNavigationTypes.SearchScreen>
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <View style={styles.view}>
        <SearchBar
          placeholder="Search assets ..."
          containerStyle={{ backgroundColor: 'transparent' }}
          inputContainerStyle={{ borderRadius: 50 }}
          //   onChangeText={updateSearch}
          //   value={search}
        />
      </View>
      <SearchOptionsList />
      {/* <AssetList
        ref={assetListRef}
        sections={recyclerSections}
        scrollY={scrollY}
        onSelectedItemsChange={onSelectedItemsChange}
        onAssetLoadError={onAssetLoadError}
        renderFooter={renderFooter}
        onItemPress={onItemPress}
        onStoryPress={onStoryPress}
      /> */}
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    
  },
})
