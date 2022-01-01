import React from "react"
import { View, ViewStyle, TextStyle, Image, StyleSheet } from "react-native"
import { HeaderProps } from "./header.props"
import { Button } from "../button/button"
import { Text } from "../text/text"
//import { Icon } from "../icon/icon"
import { spacing } from "../../theme"
import { translate } from "../../i18n/"
import Animated from "react-native-reanimated"
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs"
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
interface Props extends BottomTabHeaderProps {

}
export function TabHeader({ navigation, route, options, ...props }: Props) {
  return (
    <Animated.View {...props} style={[styles.container, options?.headerStyle]} >
      {options?.title ?
        <Text>{options?.title}</Text>
        : <Image style={styles.logo} fadeDuration={0} resizeMode="contain" source={require("../../../assets/images/logo.png")} />
      }
      <View style={styles.endSection}>
        <FontAwesome5 name={'user-circle'} size={35} color="blue" style={{ paddingEnd: 15 }} />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "white",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-around",
  },
  endSection:{ 
    end: 0,
    position: "absolute" 
  },
  logo: {
    height: 30
  }
})