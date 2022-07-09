import React from "react"
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native"

type Props = {
    style?: StyleProp<ViewStyle>
}
export const HeaderLeftContainer: React.FC<Props> = ({ style, children }) => {
    return (
        <View style={[styles.headerLeftContainer,style]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    headerLeftContainer: {
        flex: 1,
        flexDirection: "row",
        paddingStart: 5,
        alignItems:"center"
    },
})