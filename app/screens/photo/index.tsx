import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { palette } from "../../theme/palette"

interface PhotoScreenProps {}

export const PhotoScreen: React.FC<PhotoScreenProps> = () => {
  return (
    <View style={styles.wrapper}>
      <Text>Photo Screen</Text>
    </View>
  )
}

export const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.blue,
    flex: 1,
    height: "100%",
    width: "100%",
  },
})
