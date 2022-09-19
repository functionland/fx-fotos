import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Text } from '@rneui/themed'
import { useRecoilState } from 'recoil'
import Animated, { StyleProps } from 'react-native-reanimated'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { selectedLibraryState } from '../../store'
import { AssetListScreen } from '../index'
import {
  Header,
  HeaderLeftContainer,
  HeaderArrowBack,
} from '../../components/header'

interface Props {
  navigation: NativeStackNavigationProp<
    HomeNavigationParamList,
    HomeNavigationTypes
  >
}

export const LibraryAssetsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedLibrary] = useRecoilState(selectedLibraryState)
  const renderHeader = (
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>,
  ) => (
    <Header
      placement="left"
      style={[style]}
      centerComponent={
        <Text lineBreakMode="tail" h4>
          {selectedLibrary?.title}
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
    />
  )
  return (
    <AssetListScreen
      navigation={navigation}
      medias={selectedLibrary?.assets}
      defaultHeader={renderHeader}
    />
  )
}
