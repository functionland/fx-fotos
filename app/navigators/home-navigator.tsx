import React from 'react'
import { useTheme } from '@react-navigation/native'
import { View, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HomeScreen, LibraryScreen, SearchScreen } from '../screens'
import { TabHeader } from '../components/header/tab-header'
import { UnderConstruction } from '../components'

export type HomeNavigationParamList = {
  HomeTab: undefined
  LibraryTab: undefined
  SearchTab: undefined
}

export enum HomeNavigationTypes {
  HomeScreen = 'HomeTab',
  LibraryScreen = 'LibraryTab',
  SearchScreen = 'SearchTab',
}
function UnderConstructionScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <UnderConstruction />
    </View>
  )
}
const HomeTabs = createBottomTabNavigator()
export function HomeNavigator() {
  const { colors, dark } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <HomeTabs.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShown: false,
        header: props => <TabHeader {...props} />,
        tabBarStyle: {
          height:
            Platform.OS === 'ios' ? insets.bottom + 60 : insets.bottom + 70,
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          padding: 5,
        },
      }}
    >
      <HomeTabs.Screen
        options={{
          tabBarLabel: 'Photos',
          tabBarIcon: function tabIcon(props) {
            return (
              <FontAwesome5
                name="images"
                size={25}
                color={props?.focused ? colors.text : 'gray'}
              />
            )
          },
        }}
        name={HomeNavigationTypes.HomeScreen}
        component={HomeScreen}
      />
      <HomeTabs.Screen
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: function tabIcon(props) {
            return (
              <FontAwesome5
                name="search"
                color={props?.focused ? colors.text : 'gray'}
                size={25}
                style={{}}
              />
            )
          },
        }}
        name={HomeNavigationTypes.SearchScreen}
        component={SearchScreen}
      />
      {/* <HomeTabs.Screen
        name="Sharing"
        options={{
          tabBarLabel: 'Sharing',
          tabBarIcon: function tabIcon(props) {
            return (
              <FontAwesome5
                name="user-friends"
                color={props?.focused ? colors.text : 'gray'}
                size={25}
                style={{}}
              />
            )
          },
        }}
        component={UnderConstructionScreen}
      /> */}
      <HomeTabs.Screen
        name={HomeNavigationTypes.LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: function tabIcon(props) {
            return (
              <FontAwesome5
                name="swatchbook"
                color={props?.focused ? colors.text : 'gray'}
                size={25}
                style={{}}
              />
            )
          },
        }}
        component={LibraryScreen}
      />
    </HomeTabs.Navigator>
  )
}
