import React from "react"
import { Icon, IconProps } from "@rneui/themed"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
    iconProps?: IconProps,
    navigation?: NativeStackNavigationProp<unknown, unknown>;
}

export const HeaderArrowBack = ({ iconProps = {}, navigation }: Props) => {
    return (
        <Icon type="Ionicons" name="arrow-back" size={28} style={{marginTop:3}} {...iconProps} onPress={() => {
            navigation?.pop()
        }} />
    )
}
