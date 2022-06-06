import React, { useEffect, useRef, useState } from "react"
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Icon, Input, Text } from "@rneui/themed"
import {fula} from "react-native-fula"

import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { Header, HeaderLeftContainer, HeaderArrowBack } from "../../components/header"
import { StyleProps } from "react-native-reanimated"
import { Screen } from "../../components"
import { Boxs } from "../../services/localdb"
import { BoxEntity } from "../../realmdb/entities"
import { RootStackParamList, AppNavigationNames } from "../../navigators"

type Props = NativeStackScreenProps<RootStackParamList, AppNavigationNames.BoxAddUpdate>;
interface AddUpdateForm {
  peerId?: string | undefined
  name: string | undefined
  address: string | undefined
}
export const BoxAddUpdateScreen: React.FC<Props> = ({ navigation, route }) => {

  const pressed = useRef<boolean>(false)
  const [form, setForm] = useState<AddUpdateForm>(null)
  useEffect(() => {
    if (route.params?.box?.peerId) {
      setForm({
        peerId: route.params?.box?.peerId,
        name: route.params?.box?.name,
        address: route.params?.box?.address
      })
    } else {
      setForm({
        peerId: undefined,
        name: "",
        address: ""
      })
    }
  }, [])
  const renderHeader = () => {
    return (<Header
      centerComponent={<Text lineBreakMode="tail" h4 >{form && form.peerId?"Edit box":"Add box"}</Text>}
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={<Icon type="material-community" name="check" onPress={addUpdate} />}
    />)
  }
  const addUpdate = async () => {
    try {
      pressed.current = true
      if (!form.address || !form.name) {
        Alert.alert("Warning", "Please fill all the fields!")
        return
      }
      await fula.addBox(form.address);
      const box = {
        name: form.name,
        address: form.address,
        peerId: form.peerId
      } as BoxEntity
      await Boxs.addOrUpdate([box]);
      navigation.pop();
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Make sure the address format is correct!")
    } finally {
      pressed.current = false
    }

  }
  return (
    <Screen
      preset="scroll"
      unsafe={true}
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
      <>
        <Input
          label="Name"
          defaultValue={form?.name}
          returnKeyType="next"
          placeholder='Choose a nickname for your box'
          leftIcon={{ type: 'material-community', name: 'alpha-f-box-outline' }}
          containerStyle={{ marginTop: 20 }}
          onChangeText={(text) => {
            setForm(prev => ({
              ...prev,
              name: text
            }))
          }}
          errorProps
        />
        <Input
          label="Address"
          defaultValue={form?.address}
          placeholder='Enter your box address'
          leftIcon={{ type: 'material-community', name: 'transit-connection-variant' }}
          onChangeText={(text) => {
            setForm(prev => ({
              ...prev,
              address: text
            }))
          }}
        />

      </>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
    paddingTop: 100
  }
})