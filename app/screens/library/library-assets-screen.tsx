import React from "react"
import { StyleSheet, View } from "react-native"
import { Icon, Text } from "@rneui/themed"
import { useRecoilState } from "recoil"

import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { selectedLibraryState } from "../../store"
import { AssetListScreen } from "../index"
import { Header } from "../../components/header"

interface Props {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

export const LibraryAssetsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedLibrary] = useRecoilState(selectedLibraryState)
  const renderHeader = (style: any) => {
    return (<Header
      style={[style]}
      centerComponent={<Text h4 style={{alignSelf:"center"}}>{selectedLibrary?.title}</Text>}
      leftComponent={<View style={styles.headerLeftContainer}>
        <Icon type="Ionicons" name="arrow-back" size={30} />
      </View>}
    />)
  }
  return (
    <AssetListScreen navigation={navigation} medias={selectedLibrary?.assets} defaultHeader={renderHeader} />
  )
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    flex: 1,
    flexDirection: "row",
    paddingStart: 5
  },
})