import React from "react"
import { View, Image, StyleSheet } from "react-native"
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs"
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"
import Animated from "react-native-reanimated"
import { Text } from "../text"
import { palette, Constants } from "../../theme"
import { HomeNavigationTypes } from "../../navigators/home-navigator"

type Props = BottomTabHeaderProps

export const TabHeader = ({ route, options, ...props }: Props) => {
  return (
    <Animated.View {...props} style={[styles.container, options?.headerStyle]}>
      <View style={styles.startSection}>
        {options.headerLeft ? options.headerLeft() : null}
      </View>
      {options?.title ? (
        <Text>{options?.title}</Text>
      ) : (options.headerTitle ? options.headerTitle() :
        <Image
          style={styles.logo}
          fadeDuration={0}
          resizeMode="contain"
          source={require("../../../assets/images/logo.png")}
        />
      )}
      <View style={styles.endSection}>
        {options.headerRight ? options.headerRight() : null}
      </View>
    </Animated.View>
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
    paddingEnd: 3,
    position: "absolute",

  },
  startSection: {
    start: 0,
    paddingStart: 3,
    position: "absolute",
  },
  logo: {
    height: 30,
  },
})
