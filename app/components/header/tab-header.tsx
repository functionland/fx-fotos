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
  console.log("options headerStyle", options?.headerStyle)
  return (
    <Animated.View {...props} style={[styles.container, options?.headerStyle]}>
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
        {/* <FontAwesome5 name={"user-circle"} size={35} color="blue" /> */}
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
    paddingEnd: 15,
    position: "absolute",
  },
  logo: {
    height: 30,
  },
})
