import React from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"

type Props = {
    style?: StyleProp<ImageStyle>
}
export const HeaderLogo = (props: Props) => {
    return (
        <Image
            fadeDuration={0}
            resizeMode="contain"
            source={require("../../../assets/images/logo.png")}
            {...props}
            style={[styles.logo, props.style]}
        />
    )
}

const styles = StyleSheet.create({
    logo: {
        height: 30,
        alignSelf: "center",
        backgroundColor: "transparent"
    }
})