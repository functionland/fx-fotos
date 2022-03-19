import React from "react"
import Animated from "react-native-reanimated"
import { enableScreens } from "react-native-screens"
import { useColorScheme, View, Text } from "react-native"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NavigationContainer, DefaultTheme, DarkTheme, useRoute } from "@react-navigation/native"

import { HomeNavigation } from "./home-navigation"
import { navigationRef } from "./navigation-utilities"
import { TabHeader } from "../components/header/tab-header"
import { UnderConstruction } from '../components'
enableScreens()
export type NavigatorParamList = {
  home: undefined
  settings: undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="home">
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
          headerTransparent: true,
        }}
        component={HomeTabsNavigator}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
        }}
        component={UnderConstructionScreen}
      />
    </Stack.Navigator>
  )
}
function UnderConstructionScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center",backgroundColor:"white" }}>
      <UnderConstruction />
    </View>
  )
}

const HomeTabs = createBottomTabNavigator()

function HomeTabsNavigator({ route, navigation }) {
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
        }
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
        name="Home"
        component={HomeNavigation}
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
interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> { }

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  return (
    <Animated.View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        //theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        {...props}
      >
        <AppStack />
      </NavigationContainer>
    </Animated.View>
  )
}

AppNavigator.displayName = "AppNavigator"

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["welcome"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
