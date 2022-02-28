import React from "react"
import { HomeScreen, PhotoScreen } from "../screens"
import { createSharedElementStackNavigator } from "react-navigation-shared-element"
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
    <Navigator initialRouteName="HomeScreen">
      <Screen name={HomeNavigationTypes.HomeScreen} component={HomeScreen} />
      <Screen
        name={HomeNavigationTypes.PhotoScreen}
        component={PhotoScreen}
        sharedElements={(route, otherRoute, showing) => {
          const { section } = route.params
          return [section.data.uri]
        }}
      />
    </Navigator>
  )
}
