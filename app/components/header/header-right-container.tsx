import React from "react"
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native"
import { MainHeaderHeight } from "../../theme"

type Props = {
    style?: StyleProp<ViewStyle>
}
export const HeaderRightContainer: React.FC<Props> = ({ style, children }) => {
    return (
        <View style={[styles.headerRightContainer, style]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    headerRightContainer: {
        height: MainHeaderHeight,
        flexDirection: "row-reverse",
        paddingEnd: 5,
        alignItems:"center"
    },
})