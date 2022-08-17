import React from "react"
import { View, Platform, StyleSheet, Text } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useTheme } from "@react-navigation/native"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"

import { HomeScreen, LibraryScreen } from "../screens"
import { TabHeader } from "../components/header/tab-header"
import { UnderConstruction } from "../components"
import { heightPercentageToDP } from "react-native-responsive-screen"
import { useThemeMode } from "@rneui/themed"
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

const TabBarIconWrapper = ({ children }) => {
  return <View style={styles.tabIconWrapper}>{children}</View>
}

const HomeTabs = createBottomTabNavigator()

export function HomeNavigator() {
  const { colors } = useTheme()

  const [themeMode] = useThemeMode()

  return (
    <HomeTabs.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerTransparent: true,
        headerShown: false,
        header: (props) => <TabHeader {...props} />,
        tabBarStyle: {
          height: heightPercentageToDP(8.5),
          backgroundColor:
            themeMode === "d" ? RneDarkTheme.darkColors.platform.ios.primary : "#fff",
        },
      }}
    >
      <HomeTabs.Screen
        options={{
          tabBarLabel: "Photos",
          tabBarIcon: function tabIcon(props) {
            return (
              <TabBarIconWrapper>
                <FontAwesome5
                  name={"images"}
                  size={25}
                  color={props?.focused ? colors.text : "gray"}
                />
                <Text style={{ color: props?.focused ? colors.text : "gray", ...styles.label }}>
                  Photos
                </Text>
              </TabBarIconWrapper>
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
              <TabBarIconWrapper>
                <FontAwesome5
                  name={"search"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
                <Text style={{ color: props?.focused ? colors.text : "gray", ...styles.label }}>
                  Search
                </Text>
              </TabBarIconWrapper>
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
              <TabBarIconWrapper>
                <FontAwesome5
                  name={"user-friends"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
                <Text style={{ color: props?.focused ? colors.text : "gray", ...styles.label }}>
                  Share
                </Text>
              </TabBarIconWrapper>
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
              <TabBarIconWrapper>
                <FontAwesome5
                  name={"swatchbook"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
                <Text style={{ color: props?.focused ? colors.text : "gray", ...styles.label }}>
                  Library
                </Text>
              </TabBarIconWrapper>
            )
          },
        }}
        component={LibraryScreen}
      />
    </HomeTabs.Navigator>
  )
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    marginTop: Platform.OS === "ios" ? heightPercentageToDP(4) : 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 4,
    fontWeight: "bold",
  },
})
