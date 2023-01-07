import React, { useEffect, useRef, useState } from 'react'
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Button, Icon, Input, Text } from '@rneui/themed'
import { fula } from '@functionland/react-native-fula'
import * as helper from '../../utils/helper'

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { StyleProps } from 'react-native-reanimated'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import {
  Header,
  HeaderLeftContainer,
  HeaderArrowBack,
} from '../../components/header'
import { Screen, SelectInput, SelectInputItem } from '../../components'
import { Boxs } from '../../services/localdb'
import { BoxEntity } from '../../realmdb/entities'
import { RootStackParamList, AppNavigationNames } from '../../navigators'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { dIDCredentialsState, fulaPeerIdState } from '../../store'
import deviceUtils from '../../utils/deviceUtils'
import Toast from 'react-native-toast-message'
import * as KeyChain from '../../utils/keychain'
import { BLOX_CONNECTION_TYPES } from '../../utils/constants'

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.BoxAddUpdate
>
interface AddUpdateForm {
  id: string | undefined
  name: string | undefined
  connection: string | undefined
  protocol: string
  ipAddress: string | undefined
  port: number
  bloxPeerId?: string | undefined
}
export const BoxAddUpdateScreen: React.FC<Props> = ({ navigation, route }) => {
  const pressed = useRef<boolean>(false)
  const [form, setForm] = useState<AddUpdateForm>(null)
  const [testingConnection, setTestinConnection] = useState(false)
  const [dIDCredentials, setDIDCredentialsState] =
    useRecoilState(dIDCredentialsState)
  const setFulaPeerId = useSetRecoilState(fulaPeerIdState)

  useEffect(() => {
    if (route.params?.box?.peerId) {
      setForm({
        peerId: route.params?.box?.peerId,
        name: route.params?.box?.name,
        address: route.params?.box?.address,
      })
    } else {
      setForm({
        peerId: undefined,
        name: '',
        connection: BLOX_CONNECTION_TYPES.find(item => item.title === 'FxRelay')
          ?.value,
        port: 4001,
        protocol: 'tcp',
      })
    }
  }, [])
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          {form && form.peerId ? 'Edit blox' : 'Add blox'}
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={
        <Icon type="material-community" name="check" onPress={addUpdate} />
      }
    />
  )
  const addUpdate = async () => {
    try {
      if (pressed.current) return
      pressed.current = true
      if (!form.name) {
        Alert.alert('Warning', 'Please fill the name field!')
        return
      }
      try {
        const peerId = await newFulaClient()
        if (peerId) {
          const fulaPeerId = await KeyChain.save(
            'peerId',
            peerId,
            KeyChain.Service.FULAPeerIdObject,
          )
          if (fulaPeerId) {
            setFulaPeerId(fulaPeerId)
          }
        } else {
          throw 'Address is invalid'
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Address',
          text2: 'Please make sure the address is a valid address!',
          position: 'bottom',
          bottomOffset: 0,
        })
        return
      }
      const box = {
        name: form.name,
        address: form.address,
        peerId: form.peerId,
      } as BoxEntity
      await Boxs.addOrUpdate([box])
      navigation.pop()
    } catch (error) {
      console.log(error)
    } finally {
      pressed.current = false
    }
  }

  const newFulaClient = async () => {
    if (dIDCredentials?.username && dIDCredentials?.password && form.address) {
      const keyPair = helper.getMyDIDKeyPair(
        dIDCredentials.username,
        dIDCredentials.password,
      )
      try {
        if (await fula.isReady()) await fula.shutdown()
        const peerId = await fula.newClient(
          keyPair.secretKey.toString(), //bytes of the privateKey of did identity in string format
          `${deviceUtils.DocumentDirectoryPath}/wnfs`, // leave empty to use the default temp one
          form.address,
          '', //leave empty for testing without a backend node
          false,
        )
        return peerId
      } catch (error) {
        console.log('newFulaClient', error)
        return null
      }
    }
  }

  const checkConnection = async () => {
    if (dIDCredentials?.username && dIDCredentials?.password && form.address) {
      setTestinConnection(true)
      try {
        const peerId = await newFulaClient()
        if (peerId) {
          const connection = await fula.checkConnection()
          if (connection) {
            Toast.show({
              type: 'success',
              text1: 'Connected successfully!',
              position: 'bottom',
              bottomOffset: 0,
            })
          } else {
            Toast.show({
              type: 'error',
              text1: 'Failed',
              text2: 'Unable to connect to this address!',
              position: 'bottom',
              bottomOffset: 0,
            })
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Invalid Address',
            text2: 'Please make sure the address is a valid address!',
            position: 'bottom',
            bottomOffset: 0,
          })
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Unknown error',
          text2: 'There is an issue to test the connection!',
          position: 'bottom',
          bottomOffset: 0,
        })
      } finally {
        setTestinConnection(false)
      }
    }
  }
  return (
    <Screen
      preset="scroll"
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
          placeholder="Choose a nickname for your blox"
          leftIcon={{
            type: 'material-community',
            name: 'alpha-f-box-outline',
          }}
          onChangeText={text => {
            setForm(prev => ({
              ...prev,
              name: text,
            }))
          }}
          errorProps
        />
        <SelectInput
          label="Connection"
          placeholder="Choose a nickname for your blox"
          leftIcon={{
            type: 'material-community',
            name: 'alpha-f-box-outline',
          }}
          onSelectChange={item => {
            setForm(prev => ({
              ...prev,
              connection: item.value,
            }))
          }}
          items={BLOX_CONNECTION_TYPES.map<SelectInputItem>(item => ({
            value: item.value,
            title: item.title,
            description: item.description,
          }))}
          errorProps
        />
        {!form?.connection && (
          <Input
            label="IP Address"
            defaultValue={form?.ipAddress}
            returnKeyType="next"
            placeholder="Enter the blox IP address"
            leftIcon={{
              type: 'material-community',
              name: 'alpha-f-box-outline',
            }}
            onChangeText={text => {
              setForm(prev => ({
                ...prev,
                name: text,
              }))
            }}
            errorProps
          />
        )}
        {!form?.connection && (
          <Input
            label="Port"
            keyboardType="numeric"
            defaultValue={form?.port}
            returnKeyType="next"
            placeholder="Enter the blox port number"
            leftIcon={{
              type: 'material-community',
              name: 'alpha-f-box-outline',
            }}
            onChangeText={text => {
              setForm(prev => ({
                ...prev,
                name: text,
              }))
            }}
            errorProps
          />
        )}
        <SelectInput
          label="Protocol"
          leftIcon={{
            type: 'material-community',
            name: 'alpha-f-box-outline',
          }}
          onSelectChange={item => {
            setForm(prev => ({
              ...prev,
              protocol: item.value,
            }))
          }}
          items={[
            {
              title: 'TCP',
              value: 'tcp',
            },
          ]}
          errorProps
        />
        <Input
          label="Blox PeerId"
          defaultValue={form?.address}
          placeholder="Leave it empty just for test"
          leftIcon={{
            type: 'material-community',
            name: 'transit-connection-variant',
          }}
          onChangeText={text => {
            setForm(prev => ({
              ...prev,
              address: text,
            }))
          }}
        />
        <Button
          title="Test the connection"
          loading={testingConnection}
          disabled={!form?.address}
          onPress={checkConnection}
        ></Button>
      </>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
})
