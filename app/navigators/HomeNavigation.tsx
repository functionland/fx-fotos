import React from "react"
import { createSharedElementStackNavigator } from "react-navigation-shared-element"

import { HomeScreen, PhotoScreen } from "../screens"
import { RecyclerAssetListSection } from "../types"

export type HomeNavigationParamList = {
  HomeScreen: undefined
  PhotoScreen: { section: RecyclerAssetListSection }
}

export enum HomeNavigationTypes {
  HomeScreen = "HomeScreen",
  PhotoScreen = "PhotoScreen",
}

const HomeNavigationStack = createSharedElementStackNavigator<HomeNavigationParamList>()

export const HomeNavigation = () => {
  const { Navigator, Screen } = HomeNavigationStack

  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: "transparent" },
        animationEnabled: true,
      }}
    >
      <Screen name={HomeNavigationTypes.HomeScreen} component={HomeScreen} />
      <Screen
        name={HomeNavigationTypes.PhotoScreen}
        component={PhotoScreen}
        sharedElements={(route) => {
          const { section } = route.params
          return [section.data.uri]
        }}
      />
    </Navigator>
  )
}
