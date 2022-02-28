import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { HomeScreen, PhotoScreen } from "../screens"

export type HomeNavigationParamList = {
  HomeScreen: undefined
  PhotoScreen: { id: string }
}

export enum HomeNavigationTypes {
  HomeScreen = "HomeScreen",
  PhotoScreen = "PhotoScreen",
}

const HomeNavigationStack = createStackNavigator<HomeNavigationParamList>()

export const HomeNavigation = () => {
  const { Navigator, Screen } = HomeNavigationStack

  return (
    <Navigator initialRouteName="HomeScreen">
      <Screen name={HomeNavigationTypes.HomeScreen} component={HomeScreen} />
      <Screen name={HomeNavigationTypes.PhotoScreen} component={PhotoScreen} />
    </Navigator>
  )
}
