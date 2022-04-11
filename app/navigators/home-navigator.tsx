import React from "react"
import { View } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
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
  return (
    <HomeTabs.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShown: true,
        header: (props) => <TabHeader {...props} />,
        tabBarStyle: {
          height: 70,
          backgroundColor: "white",
        },
        tabBarLabelStyle: {
          fontSize: 15,
          color: "black",
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
                color={props?.focused ? "blue" : "gray"}
                style={{}}
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
                color={props?.focused ? "blue" : "gray"}
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
                color={props?.focused ? "blue" : "gray"}
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
                color={props?.focused ? "blue" : "gray"}
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
