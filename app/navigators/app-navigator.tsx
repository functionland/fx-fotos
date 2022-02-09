/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from "react"
import { useColorScheme, View, Text } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from "react-native-screens"

import { HomeScreen } from "../screens"
import { navigationRef } from "./navigation-utilities"
import Animated from "react-native-reanimated"
import { AnimatedHeader } from "../components/header/animated-header"
import { TabHeader } from "../components/header/tab-header"
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */

enableScreens();
export type NavigatorParamList = {
  home: undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerHideShadow: true,
      }}
      initialRouteName="homeTabs"
    >
      <Stack.Screen
        name="homeTabs"
        options={{
          headerShown: false,
          headerTransparent: true,
        }}
        component={HomeTabsNavigator}
      />
      <Stack.Screen
        name="settings2"
        options={{
          headerShown: true,
          
        }}
        component={SettingsScreen}
      />
    </Stack.Navigator>

  )
}
function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const HomeTabs = createBottomTabNavigator();

function HomeTabsNavigator() {
  return (
    <HomeTabs.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShown: true,
        header: (props) => <TabHeader {...props} />,
        tabBarStyle: {
          height: 70,
          backgroundColor:"white"
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
          tabBarIcon: (props) => <FontAwesome5 name={'images'} size={25} color={props?.focused ? "blue" : "gray"} style={{}} />
        }}

        name="Home" component={HomeScreen} />
      <HomeTabs.Screen
        name="Search"
        options={{
          tabBarIcon: (props) => <FontAwesome5 name={'search'} color={props?.focused ? "blue" : "gray"} size={25} style={{}} />
        }}
        component={SettingsScreen} />
      <HomeTabs.Screen
        name="Sharing"
        options={{
          tabBarIcon: (props) => <FontAwesome5 name={'user-friends'} color={props?.focused ? "blue" : "gray"} size={25} style={{}} />
        }}
        component={SettingsScreen} />
      <HomeTabs.Screen
        name="Library"
        options={{
          tabBarIcon: (props) => <FontAwesome5 name={'swatchbook'} color={props?.focused ? "blue" : "gray"} size={25} style={{}} />
        }}
        component={SettingsScreen} />
    </HomeTabs.Navigator>
  );
}
interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> { }

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  return (
    <Animated.View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
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
