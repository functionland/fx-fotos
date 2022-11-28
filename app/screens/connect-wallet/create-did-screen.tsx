import React, { useEffect, useRef, useState } from 'react'
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Button, Icon, Input, Text } from '@rneui/themed'

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'

import { Header, HeaderArrowBack } from '../../components/header'
import { Screen } from '../../components'
import { RootStackParamList, AppNavigationNames } from '../../navigators'
import { useWalletConnect } from '@walletconnect/react-native-dapp'

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.BoxAddUpdate
>

export const CreateDIDScreen: React.FC<Props> = ({ navigation, route }) => {
  const walletConnector = useWalletConnect()
  useEffect(() => {}, [])
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Create DID
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={<Icon type="material-community" name="check" />}
    />
  )
  const signWalletAddress = async () => {
    try {
      const messageBytes = new TextEncoder().encode(
        walletConnector?.accounts[0],
      )
      if (!walletConnector.session?.connected)
        await walletConnector.createSession()
      const walletSignature = await walletConnector.signPersonalMessage([
        messageBytes,
        walletConnector?.accounts[0],
      ])
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
      <>
        <View style={styles.section}>
          <Button onPress={signWalletAddress} title="Sign the password" />
        </View>
      </>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  section: {
    paddingTop: 20,
    alignItems: 'center',
  },
})
