import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, CheckBox, Icon, Input, Text } from '@rneui/themed'

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { HDKEY } from '@functionland/fula-sec'
import { useRecoilState } from 'recoil'

import * as Keychain from '../../utils/keychain'
import { Header, HeaderArrowBack } from '../../components/header'
import { Screen } from '../../components'
import { RootStackParamList, AppNavigationNames } from '../../navigators'
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import { dIDCredentials } from '../../store'
type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.BoxAddUpdate
>

export const CreateDIDScreen: React.FC<Props> = ({ navigation, route }) => {
  const walletConnector = useWalletConnect()
  const [dIDCredentialsState, setDIDCredentialsState] =
    useRecoilState(dIDCredentials)
  const [iKnow, setIKnow] = useState(false)
  const [passwod, setPassword] = useState('')
  useEffect(() => {}, [])
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Link DID
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      //rightComponent={<Icon type="material-community" name="check" />}
    />
  )
  const signPassword = async () => {
    try {
      const ed = new HDKEY(passwod)
      const chainCode = ed.chainCode
      if (!walletConnector.session?.connected)
        await walletConnector.createSession()
      const walletSignature = await walletConnector.signPersonalMessage([
        chainCode,
        walletConnector?.accounts[0],
      ])
      const passwordCredentials = await Keychain.save(
        passwod,
        walletSignature,
        Keychain.Service.DIDCredentials,
      )
      if (passwordCredentials) {
        setDIDCredentialsState(passwordCredentials)
        navigation.reset({
          index: 0,
          routes: [
            { name: AppNavigationNames.HomeScreen },
            { name: AppNavigationNames.AccountScreen },
          ],
        })
      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong, please try again!',
          position: 'bottom',
          bottomOffset: 0,
        })
      }
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: 'Unable to sign the wallet address!',
        text2: `${error}`,
        position: 'bottom',
        bottomOffset: 0,
      })
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
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <View style={styles.section}>
          <Icon name="key-link" type="material-community" size={100} />
        </View>
        <View style={styles.section}>
          <Text style={styles.textCenter}>
            You need to link a password to your wallet to generate your DID
          </Text>
        </View>
        <View style={styles.section}>
          <Input
            returnKeyType="done"
            placeholder="Enter your password"
            containerStyle={{
              marginTop: 20,
            }}
            textContentType="password"
            secureTextEntry={true}
            style={{ textAlign: 'center' }}
            onChangeText={text => setPassword(text)}
            errorProps
          />
        </View>
        <View style={styles.section}>
          <Icon name="md-warning-outline" type="ionicon" size={24} />
          <Text style={styles.textCenter}>
            You should always use the same password or you cannot retrieve your
            identity and data!
          </Text>
          <CheckBox
            title="I understand the risk of losing my password"
            checked={iKnow}
            onPress={() => setIKnow(!iKnow)}
          />
        </View>
        <View style={styles.section}>
          <Button
            disabled={!iKnow || !passwod?.length}
            onPress={signPassword}
            title="Link password"
          />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {},
  section: {
    paddingHorizontal: 30,
    paddingTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  textCenter: {
    textAlign: 'center',
  },
})
