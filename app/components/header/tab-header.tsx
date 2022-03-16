import React from "react"
import { View, Image, StyleSheet } from "react-native"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs"
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"

import { Text } from "../text"
import { palette, Constants } from "../../theme"
import { HomeNavigationTypes } from "../../navigators/home-navigation"

interface Props extends BottomTabHeaderProps {}

export const TabHeader = ({ route, options, ...props }: Props) => {
  const routeName = getFocusedRouteNameFromRoute(route)

  if (routeName === HomeNavigationTypes.PhotoScreen) {
    return null
  }

  return (
    <View {...props} style={[styles.container, options?.headerStyle]}>
      {options?.title ? (
        <Text>{options?.title}</Text>
      ) : (
        <Image
          style={styles.logo}
          fadeDuration={0}
          resizeMode="contain"
          source={require("../../../assets/images/logo.png")}
        />
      )}
      <View style={styles.endSection}>
        <FontAwesome5 name={"user-circle"} size={35} color="blue" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: palette.white,
    flexDirection: "row",
    height: Constants.HeaderHeight,
    justifyContent: "space-around",
  },
  endSection: {
    end: 0,
    paddingEnd: 15,
    position: "absolute",
  },
  logo: {
    height: 30,
  },
})
