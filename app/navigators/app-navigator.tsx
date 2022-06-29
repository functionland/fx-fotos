import React, { useContext, useEffect, useState } from "react"
import Animated from "react-native-reanimated"
import { enableScreens } from "react-native-screens"
import { NavigationContainer } from "@react-navigation/native"
import { createSharedElementStackNavigator } from "react-navigation-shared-element"
import Toast from 'react-native-toast-message'

import { navigationRef } from "./navigation-utilities"
import { PhotoScreen, LibraryAssetsScreen, BoxListScreen, BoxAddUpdateScreen, AccountScreen, ShareViewerScreen } from "../screens"
import { HomeNavigator } from "./home-navigator"
import { ThemeContext } from '../theme';
import { BoxEntity } from "../realmdb/entities"

enableScreens()
export type RootStackParamList = {
  Home: undefined
  Photo: { section: RecyclerAssetListSection },
  Account: undefined,
  Settings: undefined,
  BoxList: undefined,
  BoxAddUpdate: { box: BoxEntity },
  SharedViewer: { assetURI: string }
}
export enum AppNavigationNames {
  HomeScreen = "Home",
  AccountScrenn = "AccountScreen",
  PhotoScreen = "Photo",
  LibraryAssets = "LibraryAssets",
  BoxList = "BoxList",
  BoxAddUpdate = "BoxAddUpdate",
  SharedViewer = "SharedViewer"
}
const Stack = createSharedElementStackNavigator<RootStackParamList>()

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
        name={AppNavigationNames.BoxList}
        component={BoxListScreen}
      />
      <Stack.Screen
        name={AppNavigationNames.BoxAddUpdate}
        component={BoxAddUpdateScreen}
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
          const { assetUri = "" } = route.params
          return [assetUri]
        }}

      />
      <Stack.Screen
        name={AppNavigationNames.AccountScrenn}
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
          headerShown: false,
          cardOverlayEnabled: true,
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
        component={AccountScreen}
        sharedElements={(route) => {
          return [
            {
              id: `AccountAvatar`,
              animation: 'move',
            },
          ];
        }}

      />
      <Stack.Screen
        name={AppNavigationNames.SharedViewer}
        component={ShareViewerScreen}
      />
    </Stack.Navigator>
  )
}


type NavigationProps = Partial<React.ComponentProps<typeof NavigationContainer>>

export const AppNavigator = (props: NavigationProps) => {
  const { theme } = useContext(ThemeContext);
  const [toastVisible, setToastVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setToastVisible(true)
    }, 1000);
  }, [])
  return (
    <Animated.View style={{ flex: 1 }}>
      <NavigationContainer
        theme={theme}
        ref={navigationRef}
        linking={{
          prefixes: ["https://fotos.fx.land", "http://fotos.fx.land", "fotos://fotos.fx.land"],
          config: {
            initialRouteName: AppNavigationNames.HomeScreen,
            screens: {
              [AppNavigationNames.SharedViewer]: "shared/:jwe"
            }
          }
        }}
        //theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        {...props}
      >
        <AppStack />
      </NavigationContainer>
      {toastVisible && <Toast />}
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
