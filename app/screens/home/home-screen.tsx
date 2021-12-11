import React, { FC } from "react"
import { ImageStyle, Platform, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import {
    BulletItem,
    Button,
    Header,
    Text,
    Screen,
    AutoImage as Image,
    GradientBackground,
} from "../../components"
import { NavigatorParamList } from "../../navigators"
import { color, spacing } from "../../theme"

const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
    backgroundColor: color.transparent,
    paddingHorizontal: spacing[4],
}
const DEMO: ViewStyle = {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: color.palette.deepPurple,
}
const BOLD: TextStyle = { fontWeight: "bold" }
const DEMO_TEXT: TextStyle = {
    ...BOLD,
    fontSize: 13,
    letterSpacing: 2,
}
const HEADER: TextStyle = {
    paddingTop: spacing[3],
    paddingBottom: spacing[5] - 1,
    paddingHorizontal: 0,
}
const HEADER_TITLE: TextStyle = {
    ...BOLD,
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
    letterSpacing: 1.5,
}
const TITLE: TextStyle = {
    ...BOLD,
    fontSize: 28,
    lineHeight: 38,
    textAlign: "center",
    marginBottom: spacing[5],
}
const TAGLINE: TextStyle = {
    color: "#BAB6C8",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing[4] + spacing[1],
}
const IGNITE: ImageStyle = {
    marginVertical: spacing[6],
    alignSelf: "center",
    width: 180,
    height: 100,
}
const LOVE_WRAPPER: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
}
const LOVE: TextStyle = {
    color: "#BAB6C8",
    fontSize: 15,
    lineHeight: 22,
}
const HEART: ImageStyle = {
    marginHorizontal: spacing[2],
    width: 10,
    height: 10,
    resizeMode: "contain",
}
const HINT: TextStyle = {
    color: "#BAB6C8",
    fontSize: 12,
    lineHeight: 15,
    marginVertical: spacing[2],
}

const platformCommand = Platform.select({
    ios: "Cmd + D",
    android: "Cmd/Ctrl + M",
})

export const HomeScreen: FC<StackScreenProps<NavigatorParamList, "home">> =
    ({ navigation }) => {
        return (
            <Screen style={CONTAINER} preset="scroll" backgroundColor={color.transparent}>
            </Screen>
        )
    }
