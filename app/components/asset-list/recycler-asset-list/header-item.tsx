import React from "react";
import { Text, View, StyleSheet, ViewStyle,TextStyle } from "react-native";

interface Props {
    title: string | undefined,
    textStyle: TextStyle,
    containerStyle: ViewStyle
}

const HeaderItem: React.FC<Props> = (props) => {
    const { title, children } = props;
    return (
        <View style={[styles.container, containerStyle]}>
            {title ? <Text style={[styles.text, textStyle]} >{title}</Text> : null}
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 20,
        marginTop: 10
    },
    text: {
        fontSize: 18
    }
})


export default HeaderItem;