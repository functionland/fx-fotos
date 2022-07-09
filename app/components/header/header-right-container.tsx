import React from "react"
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native"

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
        flex: 1,
        flexDirection: "row-reverse",
        paddingEnd: 5,
        alignItems:"center"
    },
})