import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Icon, Input, Text } from "@rneui/themed"
import Animated from "react-native-reanimated"

import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { Header, HeaderLeftContainer, HeaderArrowBack } from "../../components/header"
import { StyleProps } from "react-native-reanimated"
import { Screen } from "../../components"

interface Props {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

export const BoxAddUpdateScreen: React.FC<Props> = ({ navigation }) => {
  const renderHeader = (style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>) => {
    return (<Header
      style={[style]}
      centerComponent={<Text lineBreakMode="tail" h4 >Add box</Text>}
      leftComponent={<HeaderArrowBack navigation={navigation} />}
    />)
  }
  return (
    <Screen
      preset="scroll"
      unsafe={true}
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
      <>
        <Input
          returnKeyType="next"
          onEndEditing={(e) => {
            console.log("onKeyPress:", e.nativeEvent.text)
          }}
          placeholder='Box name'
          leftIcon={{ type: 'material-community', name: 'alpha-f-box-outline' }}

        />
        <Input
          placeholder='Box address'
          leftIcon={{ type: 'material-community', name: 'transit-connection-variant' }}
        />

      </>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
    paddingTop: 120
  }
})