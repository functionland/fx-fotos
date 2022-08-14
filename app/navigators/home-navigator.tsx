import React from "react"
import { View, Platform, Text, StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useTheme } from "@react-navigation/native"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"

import { HomeScreen, LibraryScreen } from "../screens"
import { TabHeader } from "../components/header/tab-header"
import { UnderConstruction } from "../components"
import { heightPercentageToDP } from "react-native-responsive-screen"
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

const TabIconWrapper = ({ children }) => {
  return <View style={styles.tabIconWrapper}>{children}</View>
}

const HomeTabs = createBottomTabNavigator()
export function HomeNavigator() {
  const { colors } = useTheme() 
  return (
    <HomeTabs.Navigator
      screenOptions={{
        tabBarShowLabel: false,
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
          tabBarIcon: function tabIcon(props) {
            return (
              <TabIconWrapper>
                <FontAwesome5
                  name={"images"}
                  size={25}
                  color={props?.focused ? colors.text : "gray"}
                />
                <Text
                  style={{
                    marginTop: 5,
                    color: props?.focused ? colors.text : "gray",
                    fontWeight: "bold",
                  }}
                >
                  Photos
                </Text>
              </TabIconWrapper>
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
              <TabIconWrapper>
                <FontAwesome5
                  name={"search"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                />
                <Text
                  style={{
                    marginTop: 5,
                    color: props?.focused ? colors.text : "gray",
                    fontWeight: "bold",
                  }}
                >
                  Search
                </Text>
              </TabIconWrapper>
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
              <TabIconWrapper>
                <FontAwesome5
                  name={"user-friends"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
                <Text
                  style={{
                    marginTop: 5,
                    color: props?.focused ? colors.text : "gray",
                    fontWeight: "bold",
                  }}
                >
                  Sharing
                </Text>
              </TabIconWrapper>
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
              <TabIconWrapper>
                <FontAwesome5
                  name={"swatchbook"}
                  color={props?.focused ? colors.text : "gray"}
                  size={25}
                  style={{}}
                />
                <Text
                  style={{
                    marginTop: 5,
                    color: props?.focused ? colors.text : "gray",
                    fontWeight: "bold",
                  }}
                >
                  Library
                </Text>
              </TabIconWrapper>
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
    marginTop: Platform.OS === 'ios' ?  heightPercentageToDP(4) : 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
})
