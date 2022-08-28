import React, { useContext, useEffect, useState } from "react"
import Animated from "react-native-reanimated"
import { enableScreens } from "react-native-screens"
import { NavigationContainer } from "@react-navigation/native"
import { createSharedElementStackNavigator } from "react-navigation-shared-element"
import Toast from "react-native-toast-message"

import { navigationRef } from "./navigation-utilities"
import {
  PhotoScreen,
  LibraryAssetsScreen,
  BoxListScreen,
  BoxAddUpdateScreen,
  HighlightScreen,
  AccountScreen,
  ShareViewerScreen,
  ImageGalleryViewerScreen
} from "../screens"
import { HomeNavigator } from "./home-navigator"
import { ThemeContext } from "../theme"
import { BoxEntity } from "../realmdb/entities"
import { Asset, AssetStory, RecyclerAssetListSection } from "../types"

enableScreens()
export type RootStackParamList = {
  Home: undefined
  LibraryAssets: undefined
  Photo: { section: RecyclerAssetListSection }
  HighlightScreen: {highlights:AssetStory|undefined}
  AccountScreen: undefined
  Account: undefined
  Settings: undefined
  BoxList: undefined
  BoxAddUpdate: { box: BoxEntity }
  SharedViewer: { assetURI: string }
  ImageGalleryViewer: { assetId: Asset['id'], scrollToItem: (item: RecyclerAssetListSection, animated?: boolean) => void}
}
export enum AppNavigationNames {
  HomeScreen = "Home",
  AccountScreen = "AccountScreen",
  PhotoScreen = "Photo",
  LibraryAssets = "LibraryAssets",
  BoxList = "BoxList",
  BoxAddUpdate = "BoxAddUpdate",
  SharedViewer = "SharedViewer",
  HighlightScreen = "HighlightScreen",
  ImageGalleryViewer = "ImageGalleryViewer"
}

const Stack = createSharedElementStackNavigator<RootStackParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={AppNavigationNames.HomeScreen}
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
      }}
    >
      <Stack.Screen name={AppNavigationNames.HomeScreen} component={HomeNavigator} />
      <Stack.Screen name={AppNavigationNames.LibraryAssets} component={LibraryAssetsScreen} />
      <Stack.Screen name={AppNavigationNames.BoxList} component={BoxListScreen} />
      <Stack.Screen name={AppNavigationNames.BoxAddUpdate} component={BoxAddUpdateScreen} />
      <Stack.Screen
        name={AppNavigationNames.PhotoScreen}
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
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
          const { assetId = "" } = route.params
          return [assetId]
        }}
      />
      <Stack.Screen
        name={AppNavigationNames.HighlightScreen}
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
          cardOverlayEnabled: true,
          animationEnabled: true,
          cardStyle: { backgroundColor: "transparent" },
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
        component={HighlightScreen}
      />
      <Stack.Screen
        name={AppNavigationNames.ImageGalleryViewer}
        options={{
          detachPreviousScreen: false,
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
          cardOverlayEnabled: true,
          cardStyle: { backgroundColor: "transparent" },
          animationEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            containerStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
            },
          }),
        }}
        component={ImageGalleryViewerScreen}
        sharedElements={(route) => {
          const { assetId = "" } = route.params
          return [
            {
              id: assetId,
            },
          ]
        }}
      />
      <Stack.Screen
        name={AppNavigationNames.AccountScreen}
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
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
              animation: "move",
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
  const { theme } = useContext(ThemeContext)
  const [toastVisible, setToastVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setToastVisible(true)
    }, 1000)
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
              [AppNavigationNames.SharedViewer]: "shared/:jwe",
            },
          },
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
