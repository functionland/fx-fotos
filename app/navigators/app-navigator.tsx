import React, { useContext } from "react"
import Animated from "react-native-reanimated"
import { enableScreens } from "react-native-screens"
import { NavigationContainer } from "@react-navigation/native"
import { createSharedElementStackNavigator } from "react-navigation-shared-element"

import { navigationRef } from "./navigation-utilities"
import { PhotoScreen, LibraryAssetsScreen } from "../screens"
import { HomeNavigator } from "./home-navigator"
import { ThemeContext } from '../theme';
enableScreens()
export type NavigatorParamList = {
  home: undefined
  photo: { section: RecyclerAssetListSection }
  settings: undefined
}
export enum AppNavigationNames {
  HomeScreen = "home",
  PhotoScreen = "photo",
  LibraryAssets = "LibraryAssets"
}
const Stack = createSharedElementStackNavigator<NavigatorParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      nitialRouteName={AppNavigationNames.HomeScreen}
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
      }}
    >
      <Stack.Screen
        name={AppNavigationNames.HomeScreen}
        component={HomeNavigator}
      />
      <Stack.Screen
        name={AppNavigationNames.LibraryAssets}
        component={LibraryAssetsScreen}
      />
      <Stack.Screen
        name={AppNavigationNames.PhotoScreen}
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
          headerShown: false,
          cardOverlayEnabled: true,
          cardStyle: { backgroundColor: "transparent" },
          animationEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
            },
            overlayStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0],
                extrapolate: "clamp",
              }),
            },
          }),
        }}
        component={PhotoScreen}
        sharedElements={(route) => {
          const { section } = route.params
          return [section.data.uri]
        }}

      />
    </Stack.Navigator>
  )
}


type NavigationProps = Partial<React.ComponentProps<typeof NavigationContainer>>

export const AppNavigator = (props: NavigationProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Animated.View style={{ flex: 1 }}>
      <NavigationContainer
        theme={theme}
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
