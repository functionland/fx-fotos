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
type ConnectToWalletStatus = 'None' | 'Connecting' | 'Connected' | 'Failed'

export const ConnectWalletScreen: React.FC<Props> = ({ navigation, route }) => {
  const [connectToWalletStatus, setConnectToWalletStatus] =
    useState<ConnectToWalletStatus>('None')
  const walletConnector = useWalletConnect()
  console.log('connectToWalletStatus', connectToWalletStatus)
  useEffect(() => {}, [])
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Connect to wallet
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={<Icon type="material-community" name="check" />}
    />
  )
  const connectToWallet = async () => {
    try {
      if (connectToWalletStatus !== 'None') {
        setConnectToWalletStatus('None')
        return
      }
      setConnectToWalletStatus('Connecting')
      await walletConnector.connect()
      setConnectToWalletStatus('Connected')
    } catch (error) {
      console.log(error)
      setConnectToWalletStatus('Failed')
      Toast.show({
        type: 'error',
        text1: 'Unable to connect to wallet',
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
          <Button
            onPress={connectToWallet}
            title={
              connectToWalletStatus == 'None' ? 'Connect your wallet' : 'Cancel'
            }
          />
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
