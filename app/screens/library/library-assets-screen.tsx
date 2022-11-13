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
import { Header, HeaderArrowBack } from '../../components/header'
import { Screen } from '../../components'

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
    <Animated.View
      style={[
        { position: 'absolute', top: 0, zIndex: 99, width: '100%' },
        style,
      ]}
    >
      <Header
        containerStyle={{ position: 'relative' }}
        placement="left"
        centerComponent={
          <Text lineBreakMode="tail" h4>
            {selectedLibrary?.title}
          </Text>
        }
        leftComponent={<HeaderArrowBack navigation={navigation} />}
      />
    </Animated.View>

  )
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <AssetListScreen
        navigation={navigation}
        medias={selectedLibrary?.assets}
        defaultHeader={renderHeader}
      />
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
})
