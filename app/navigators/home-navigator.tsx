import React from "react"
import { useThemeMode } from "@rneui/themed"
import { useTheme } from "@react-navigation/native"
import { View, Platform, SafeAreaView } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import FontAwesome5 from "react-native-vector-icons/FontAwesome5"

import { HomeScreen, LibraryScreen } from "../screens"
import { TabHeader } from "../components/header/tab-header"
import { UnderConstruction } from "../components"
import { RneDarkTheme } from "../theme"
export type HomeNavigationParamList = {
  HomeScreen: undefined
}

export enum HomeNavigationTypes {
  PhotosTab = "PhotosTab",
  LibraryTab = "LibraryTab",
}
function UnderConstructionScreen() {
  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}
    >
      <UnderConstruction />
    </View>
  )
}
const HomeTabs = createBottomTabNavigator()
export function HomeNavigator() {
  const { colors } = useTheme()

  const [themeMode] = useThemeMode()

  return (
    <SafeAreaView
      style={{
        backgroundColor: themeMode === "d" ? RneDarkTheme.darkColors.platform.ios.primary : "#fff",
        height: "100%",
        width: "100%",
      }}
    >
      <HomeTabs.Navigator
        screenOptions={{
          headerTransparent: true,
          headerShown: false,
          header: (props) => <TabHeader {...props} />,
          tabBarStyle: {
            height: Platform.OS === "ios" ? 90 : 70,
          },
          tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: "600",
            padding: 5,
          },
        }}
      >
        <HomeTabs.Screen
          options={{
            tabBarLabel: "Photos",
            tabBarIcon: function tabIcon(props) {
              return (
                <FontAwesome5
                  name={"images"}
                  size={25}
                  color={props?.focused ? colors.text : "gray"}
                />
              )
            },
          }}
          name={HomeNavigationTypes.PhotosTab}
          component={HomeScreen}
        />
        <HomeTabs.Screen
          name="Search"
          options={{
            tabBarIcon: function tabIcon(props) {
              return (
                <FontAwesome5
                  name={"search"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
              )
            },
          }}
          component={UnderConstructionScreen}
        />
        <HomeTabs.Screen
          name="Sharing"
          options={{
            tabBarIcon: function tabIcon(props) {
              return (
                <FontAwesome5
                  name={"user-friends"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
              )
            },
          }}
          component={UnderConstructionScreen}
        />
        <HomeTabs.Screen
          name={HomeNavigationTypes.LibraryTab}
          options={{
            tabBarLabel: "Library",
            tabBarIcon: function tabIcon(props) {
              return (
                <FontAwesome5
                  name={"swatchbook"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
              )
            },
          }}
          component={LibraryScreen}
        />
      </HomeTabs.Navigator>
    </SafeAreaView>
  )
}
