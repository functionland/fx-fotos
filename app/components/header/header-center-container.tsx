import React from "react"
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native"
import { MainHeaderHeight } from "../../theme"

type Props = {
    style?: StyleProp<ViewStyle>
}
export const HeaderCenterContainer: React.FC<Props> = ({ style, children }) => {
    return (
        <View style={[styles.headerCenterContainer,style]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    headerCenterContainer: {
        height: MainHeaderHeight,
        flexDirection: "row",
    },
})