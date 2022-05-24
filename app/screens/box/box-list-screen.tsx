import React, { useEffect, useState, } from "react"
import { StyleSheet, View, ListRenderItemInfo, Pressable, Image } from "react-native"
import { useRecoilState } from "recoil"
import { Icon, ListItem, Text, useTheme } from "@rneui/themed"

import { Screen } from "../../components"
import { Boxs } from "../../services/localdb"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { Header, HeaderArrowBack, HeaderLogo, HeaderRightContainer } from "../../components/header"
import { FlatList } from "react-native-gesture-handler"
import { AppNavigationNames } from "../../navigators"
import { BoxEntity } from "../../realmdb/entities"
interface Props {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}
export const BoxListScreen: React.FC<Props> = ({ navigation }) => {
  const [boxs, setBoxs] = useState<BoxEntity[]>([])

  useEffect(() => {
    loadBoxs()
  }, []);

  const loadBoxs = async () => {
    const boxs = await Boxs.getAll();
    setBoxs(boxs);
  }
  const renderHeader = () => {
    return (<Header
      centerComponent={<Text lineBreakMode="tail" h4 >Boxs</Text>}
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={<HeaderRightContainer>
        <Icon type="material-community" name="plus" size={28} onPress={()=>navigation.navigate(AppNavigationNames.BoxAddUpdate)} />
      </HeaderRightContainer>}
    />)
  }

  const onItemPress = (box: BoxEntity) => {
    navigation.push(AppNavigationNames.BoxAddUpdate)
  }

  const renderItem = (box: BoxEntity) => {
    return <ListItem key={box.peerId} bottomDivider onPress={() => onItemPress(box)}>
      <ListItem.Content>
        <ListItem.Title>{box.name || "No name"}</ListItem.Title>
        <ListItem.Subtitle>{box.address}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
      {<FlatList
        contentContainerStyle={styles.listContainer}
        style={{ flex: 1 }}
        data={boxs}
        renderItem={renderItem}
      />}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
  },
  listContainer: {
    flex: 1
  },
  card: {
    flex: 1,
    padding: 10
  },
  cardImage: {
    aspectRatio: 1,
    width: '100%',
    flex: 1,
    marginBottom: 8,
    borderRadius: 15
  },
})