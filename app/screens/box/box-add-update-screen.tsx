import React, { useEffect, useRef, useState } from 'react'
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Button, Icon, Input, Text } from '@rneui/themed'
import { fula } from '@functionland/react-native-fula'
import * as helper from '../../utils/helper'

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Header, HeaderArrowBack } from '../../components/header'
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
import { Helper } from '../../utils'

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
  port: string
  peerId?: string | undefined
}
export const BoxAddUpdateScreen: React.FC<Props> = ({ navigation, route }) => {
  const pressed = useRef<boolean>(false)
  const [form, setForm] = useState<AddUpdateForm>(null)
  const [formErros, setFormErros] = useState<Record<string, string>>({})
  const [testingConnection, setTestinConnection] = useState(false)
  const [dIDCredentials, setDIDCredentialsState] =
    useRecoilState(dIDCredentialsState)
  const setFulaPeerId = useSetRecoilState(fulaPeerIdState)
  useEffect(() => {
    if (route.params?.box?.id) {
      setForm({
        ...route.params?.box,
        port: route.params?.box?.port?.toString(),
      })
    } else {
      setForm({
        id: undefined,
        name: '',
        connection: BLOX_CONNECTION_TYPES.find(item => item.title === 'FxRelay')
          ?.value,
        port: '40001',
        protocol: 'tcp',
        ipAddress: '',
        peerId: '',
      })
    }
  }, [])
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          {form && form.id ? 'Edit Blox' : 'Add Blox'}
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={
        <Icon type="material-community" name="check" onPress={addUpdate} />
      }
    />
  )
  const validateForm = (): boolean => {
    const errors = {}
    if (!form.name) {
      errors['name'] = 'The Blox name is mandatory'
    }
    if (!form.connection && !form.ipAddress) {
      errors['ipAddress'] = 'The Blox IP address is mandatory'
    }
    if (!form.connection && !form.port) {
      errors['port'] = 'The Blox port number is mandatory'
    } else if (
      !form.connection &&
      (isNaN(Number(form.port)) || !Number.isInteger(Number(form.port)))
    ) {
      errors['port'] = 'The Blox port number is invalid'
    }
    if (!form.peerId) {
      errors['peerId'] = 'The Blox peerId is mandatory'
    }
    if (Object.keys(errors)?.length > 0) {
      setFormErros(errors)
      return false
    }
    return true
  }
  const addUpdate = async () => {
    try {
      if (pressed.current) return
      pressed.current = true
      if (!validateForm()) {
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
        console.log('error', error)

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
        id: form.id,
        name: form.name,
        connection: form.connection,
        ipAddress: form.ipAddress,
        protocol: form.protocol,
        port: Number(form.port),
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
    if (dIDCredentials?.username && dIDCredentials?.password) {
      const keyPair = helper.getMyDIDKeyPair(
        dIDCredentials.username,
        dIDCredentials.password,
      )
      try {
        const bloxAddress = Helper.generateBloxAddress({ ...form } as BoxEntity)
        const isReady = await fula.isReady()
        if (isReady) await fula.shutdown()
        const peerId = await fula.newClient(
          keyPair.secretKey.toString(), //bytes of the privateKey of did identity in string format
          `${deviceUtils.DocumentDirectoryPath}/wnfs`, // leave empty to use the default temp one
          bloxAddress,
          '',
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
    if (dIDCredentials?.username && dIDCredentials?.password) {
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
          placeholder="Choose a nickname for your Blox"
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
          errorMessage={formErros?.['name']}
        />
        <SelectInput
          label="Connection"
          placeholder="Choose a nickname for your Blox"
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
          errorMessage={formErros?.['connection']}
        />
        {!form?.connection && (
          <Input
            label="IP Address"
            defaultValue={form?.ipAddress}
            returnKeyType="next"
            placeholder="Enter the Blox IP address"
            leftIcon={{
              type: 'material-community',
              name: 'alpha-f-box-outline',
            }}
            onChangeText={text => {
              setForm(prev => ({
                ...prev,
                ipAddress: text,
              }))
            }}
            errorMessage={formErros?.['ipAddress']}
          />
        )}
        {!form?.connection && (
          <Input
            label="Port"
            keyboardType="numeric"
            defaultValue={form?.port}
            returnKeyType="next"
            placeholder="Enter the Blox port number (40001)"
            leftIcon={{
              type: 'material-community',
              name: 'alpha-f-box-outline',
            }}
            onChangeText={text => {
              setForm(prev => ({
                ...prev,
                port: text,
              }))
            }}
            errorMessage={formErros?.['port']}
          />
        )}
        {!form?.connection && (
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
            errorMessage={formErros?.['protocol']}
          />
        )}
        <Input
          label="Blox PeerId"
          defaultValue={form?.peerId}
          placeholder="Enter the Blox peerId"
          leftIcon={{
            type: 'material-community',
            name: 'transit-connection-variant',
          }}
          onChangeText={text => {
            setForm(prev => ({
              ...prev,
              peerId: text,
            }))
          }}
          errorMessage={formErros?.['peerId']}
        />
        <Button
          title="Test the connection"
          loading={testingConnection}
          disabled={!form?.peerId}
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
