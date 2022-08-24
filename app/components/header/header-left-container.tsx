import React from "react"
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native"
import { heightPercentageToDP } from "react-native-responsive-screen"

type Props = {
  style?: StyleProp<ViewStyle>,
  children: any
}
export const HeaderLeftContainer: React.FC<Props> = ({ style, children }) => {
  return <View style={[styles.headerLeftContainer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    flexDirection: "row",
    paddingStart: 5,
    alignItems: "center",
    height: heightPercentageToDP(5.5),
  },
})
