import React from "react"
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"
import { createSharedElementStackNavigator } from "react-navigation-shared-element"

import { HomeScreen, PhotoScreen } from "../screens"
import { RecyclerAssetListSection } from "../types"
import { Constants } from "../theme"

export type HomeNavigationParamList = {
  HomeScreen: undefined
  PhotoScreen: { section: RecyclerAssetListSection }
}

export enum HomeNavigationTypes {
  HomeScreen = "HomeScreen",
  PhotoScreen = "PhotoScreen",
}

const HomeNavigationStack = createSharedElementStackNavigator<HomeNavigationParamList>()

export const HomeNavigation = ({ route, navigation }) => {
  const { Navigator, Screen } = HomeNavigationStack
  const routeName = getFocusedRouteNameFromRoute(route)

  React.useLayoutEffect(() => {
    if (routeName === HomeNavigationTypes.PhotoScreen) {
      navigation.setOptions({ tabBarStyle: { display: "none" } })
    } else {
      navigation.setOptions({ tabBarStyle: { display: "flex", height: Constants.TabBarHeight } })
    }
  }, [route, navigation, routeName])

  return (
    <Navigator
      screenOptions={{
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
