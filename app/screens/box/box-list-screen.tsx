import React, { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { useRecoilState } from 'recoil'
import { Icon, ListItem, Text } from '@rneui/themed'

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FlatList } from 'react-native-gesture-handler'
import { Screen } from '../../components'
import { Boxs } from '../../services/localdb'
import { boxsState } from '../../store'
import {
  Header,
  HeaderArrowBack,
  HeaderRightContainer,
} from '../../components/header'
import { AppNavigationNames, RootStackParamList } from '../../navigators'
import { BoxEntity } from '../../realmdb/entities'

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.BoxList
>

export const BoxListScreen: React.FC<Props> = ({ route, navigation }) => {
  const pressed = useRef<boolean>(false)
  const [boxs, setBoxs] = useRecoilState(boxsState)

  useEffect(() => {
    navigation.addListener('focus', loadBoxs)
    loadBoxs()
    return () => {
      navigation.removeListener('focus')
    }
  }, [])

  const loadBoxs = async () => {
    const boxs = await Boxs.getAll()
    setBoxs(boxs.map(m => m.toJSON()))
  }
  const deleteBox = async (box: BoxEntity) => {
    try {
      pressed.current = true
      await Boxs.remove([box.peerId])
      setBoxs(prev => prev.filter(item => item.peerId != box.peerId))
    } catch (error) {
      console.log(error)
    } finally {
      pressed.current = false
    }
  }
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Boxs
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={
        <HeaderRightContainer>
          <Icon
            type="material-community"
            name="plus"
            size={28}
            onPress={() => navigation.navigate(AppNavigationNames.BoxAddUpdate)}
          />
        </HeaderRightContainer>
      }
    />
  )

  const onItemPress = (box: BoxEntity) => {
    console.log('onItemPress', box)
    navigation.navigate(AppNavigationNames.BoxAddUpdate, {
      box,
    })
  }

  const renderItem = ({ item }: { item: BoxEntity }) => (
    <ListItem key={item.peerId} bottomDivider onPress={() => onItemPress(item)}>
      <ListItem.Content>
        <ListItem.Title lineBreakMode="tail">
          {item.name || 'No name'}
        </ListItem.Title>
        <ListItem.Subtitle lineBreakMode="tail">
          {item.address}
        </ListItem.Subtitle>
      </ListItem.Content>
      <Icon
        type="material-community"
        name="delete"
        size={24}
        onPress={() => deleteBox(item)}
      />
    </ListItem>
  )
  return (
    <Screen
      preset="fixed"
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
      <FlatList
        contentContainerStyle={styles.listContainer}
        style={{ flex: 1 }}
        data={boxs}
        renderItem={renderItem}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    paddingTop: 100,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: 10,
  },
  cardImage: {
    aspectRatio: 1,
    width: '100%',
    flex: 1,
    marginBottom: 8,
    borderRadius: 15,
  },
})
