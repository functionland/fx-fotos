import React from 'react'
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'

type Props = {
  style?: StyleProp<ViewStyle>
  children: any
}
export const HeaderRightContainer: React.FC<Props> = ({ style, children }) => (
  <View style={[styles.headerRightContainer, style]}>{children}</View>
)

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row-reverse',
    paddingEnd: 5,
    alignItems: 'center',
    height: heightPercentageToDP(5.5),
  },
})
