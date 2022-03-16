import React from "react";
import { Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Checkbox } from "../../..";

interface Props {
    title: string | undefined,
    selected: boolean;
    selectionMode: boolean;
    textStyle: TextStyle,
    containerStyle: ViewStyle
}

const HeaderItem: React.FC<Props> = (props) => {
    const { title, selectionMode, selected, children, containerStyle, textStyle } = props;
    return (
        <View style={[styles.container, containerStyle]}>
                {selectionMode ? <Checkbox value={selected} style={styles.checkBox} /> : null}
                {title ? <Text style={[styles.text, textStyle]} >{title}</Text> : null}
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 5
    },
    text: {
        fontSize: 18,
        marginStart: 5
    },
    checkBox: {
        marginStart: 5,
        alignSelf: "center"
    },

})


export default HeaderItem;