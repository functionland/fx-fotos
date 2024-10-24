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
import { Icon, Text, useTheme } from '@rneui/themed'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import { Screen } from '../../components'
import { useFloatHederAnimation } from '../../utils/hooks'

interface RewardsScreenProps {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<HomeNavigationParamList, HomeNavigationTypes.SearchScreen>
}
export const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [scrollY, headerStyles] = useFloatHederAnimation(33)
  const { theme } = useTheme()


  const renderNotfoundPlaceHolder = () =>
      <View style={styles.placeholderContainer}>
        <Icon type="material-community" name="emoticon-sad-outline" size={60} />
        <Text h4 style={styles.placeholderText}>
          More Rewards coming soon!
        </Text>
      </View>
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <View style={styles.container}>
        {renderNotfoundPlaceHolder()}
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    padding: 10,
  },
})
