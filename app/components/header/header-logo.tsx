import React from 'react'
import { View, Image, ImageStyle, StyleProp, StyleSheet } from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'

type Props = {
  style?: StyleProp<ImageStyle>
}
export function HeaderLogo(props: Props) {
  return (
    <View style={styles.wrapper}>
      <Image
        fadeDuration={0}
        resizeMode="contain"
        source={require('../../../assets/images/logo.png')}
        {...props}
        style={[styles.logo, props.style]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  logo: {
    height: 25,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  wrapper: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    height: heightPercentageToDP(5),
  },
})
