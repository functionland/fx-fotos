import React from "react"
import { useTheme } from "@react-navigation/native"
import { View, Platform, SafeAreaView } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import FontAwesome5 from "react-native-vector-icons/FontAwesome5"

import { HomeScreen, LibraryScreen } from "../screens"
import { TabHeader } from "../components/header/tab-header"
import { UnderConstruction } from "../components"
import { palette, RneDarkTheme, RneLightTheme } from "../theme"
import { Icon, Text } from "@rneui/themed"

import { SafeAreaProvider } from "react-native-safe-area-context"
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

interface TabBarLabelProps {
  focused: boolean
  children: any
}

const TabBarLabel: React.FC<TabBarLabelProps> = ({ focused, children }) => {
  return (
    <Text
      style={{
        color: focused ? palette.black : RneLightTheme.darkColors.grey4,
        fontSize: 14,
        paddingTop: 4,
        fontWeight: "600",
      }}
    >
      {children}
    </Text>
  )
}

import { initialWindowMetrics } from "react-native-safe-area-context"
const HomeTabs = createBottomTabNavigator()
export function HomeNavigator() {
  const { colors } = useTheme()

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <HomeTabs.Navigator
        screenOptions={{
          headerTransparent: true,
          tabBarShowLabel: false,
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
            tabBarIcon: function tabIcon(props) {
              return (
                <View>
                  <Icon
                    type="font-awesome-5"
                    name="images"
                    size={25}
                    color={props?.focused ? colors.text : "gray"}
                  />
                  <TabBarLabel focused={props.focused}>Photos</TabBarLabel>
                </View>
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
                <View>
                  <Icon
                    type="font-awesome-5"
                    name="search"
                    size={25}
                    color={props?.focused ? colors.text : "gray"}
                  />
                  <TabBarLabel focused={props.focused}>Search</TabBarLabel>
                </View>
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
                <View>
                  <Icon
                    type="font-awesome-5"
                    name="user-friends"
                    size={25}
                    color={props?.focused ? colors.text : "gray"}
                  />
                  <TabBarLabel focused={props.focused}>Share</TabBarLabel>
                </View>
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
                <View>
                  <Icon
                    type="font-awesome-5"
                    name="swatchbook"
                    size={25}
                    color={props?.focused ? colors.text : "gray"}
                  />
                  <TabBarLabel focused={props.focused}>Library</TabBarLabel>
                </View>
              )
            },
          }}
          component={LibraryScreen}
        />
      </HomeTabs.Navigator>
    </SafeAreaProvider>
  )
}
