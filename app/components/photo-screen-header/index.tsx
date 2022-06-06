import React from "react"
import { View, StyleSheet, TouchableNativeFeedback } from "react-native"
import Icon from "react-native-vector-icons/AntDesign"

import { widthPercentageToDP } from "react-native-responsive-screen"

import { Constants, palette } from "../../theme"

interface PhotoScreenHeaderProps {
  goBack: () => void
}

export const PhotoScreenHeader: React.FC<PhotoScreenHeaderProps> = ({ goBack }) => {
  return (
    <View style={styles.container}>
      <TouchableNativeFeedback onPress={goBack}>
        <Icon name="arrowleft" size={28} style={{ color: palette.white }} />
      </TouchableNativeFeedback>
      <TouchableNativeFeedback onPress={goBack}>
        <Icon name="cloud" size={28} style={{ color: palette.white }} />
      </TouchableNativeFeedback>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:"row",
    paddingTop:30,
    height: Constants.HeaderHeight,
    justifyContent: "space-between",
    paddingHorizontal: 15,
    position: "absolute",
    width: widthPercentageToDP(100),
    zIndex: 1000,
  },
})
