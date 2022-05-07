import React from "react"
import { View } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useTheme } from "@react-navigation/native"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"

import { HomeScreen } from "../screens"
import { TabHeader } from "../components/header/tab-header"
import { UnderConstruction } from "../components"
export type HomeNavigationParamList = {
  HomeScreen: undefined
}

export enum HomeNavigationTypes {
  PhotosTab = "PhotosTab",
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
  const { colors } = useTheme();
  return (
    <HomeTabs.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShown: false,
        header: (props) => <TabHeader {...props} />,
        tabBarStyle: {
          height: 70,
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
        name="Library"
        options={{
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
        component={UnderConstructionScreen}
      />
    </HomeTabs.Navigator>
  )
}
