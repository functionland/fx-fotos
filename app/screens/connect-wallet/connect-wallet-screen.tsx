import React, { useEffect, useRef, useState } from 'react'
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Button, FAB, Icon, Image, Text } from '@rneui/themed'

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'

import { Header, HeaderArrowBack } from '../../components/header'
import { Screen } from '../../components'
import { RootStackParamList, AppNavigationNames } from '../../navigators'
import { useSDK } from '@metamask/sdk-react'
import {
  chains,
  goerliChainId,
  mumbaiChainId,
} from '../../utils/walletConnectConifg'

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.BoxAddUpdate
>
type ConnectToWalletStatus = 'None' | 'Connecting' | 'Connected' | 'Failed'

export const ConnectWalletScreen: React.FC<Props> = ({ navigation, route }) => {
  const { account, chainId, provider, sdk, connected, connecting } = useSDK()
  const [connectToWalletStatus, setConnectToWalletStatus] =
    useState<ConnectToWalletStatus>(connected ? 'Connected' : 'None')

  useEffect(() => {
    if (connected) setConnectToWalletStatus('Connected')
  }, [connected])
  useEffect(() => {
    if (connecting) setConnectToWalletStatus('Connecting')
  }, [connecting])
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Connect to wallet
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
    />
  )
  const disconnectWallet = () => {
    sdk?.terminate()
  }
  const connectToWallet = async () => {
    try {
      setConnectToWalletStatus('Connecting')
      await sdk?.connect()
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
      disconnectWallet()
    }
  }
  return (
    <Screen preset="scroll" style={styles.screen}>
      {renderHeader()}
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <View style={styles.section}>
          <Icon name="wallet" type="material-community" size={100} />
        </View>
        <View style={styles.section}>
          <Text style={{ textAlign: 'center' }}>
            You need to connect the FxFotos to a wallet to generate your
            decentralized ID (DID)
          </Text>
        </View>
        <View style={styles.section}>
          <Icon name="md-warning-outline" type="ionicon" size={24} />
          <Text style={{ textAlign: 'center' }}>
            You should always use the same wallet address or you cannot retrieve
            your identity and data!
          </Text>
        </View>
        <View style={styles.section}>
          <Button
            loading={!provider || connectToWalletStatus == 'Connecting'}
            onPress={
              provider
                ? connectToWalletStatus == 'None' ||
                  connectToWalletStatus == 'Failed'
                  ? connectToWallet
                  : disconnectWallet
                : undefined
            }
            type={connectToWalletStatus == 'Connected' ? 'outline' : 'solid'}
            title={
              connectToWalletStatus == 'None' ||
              connectToWalletStatus == 'Failed'
                ? 'Connect wallet'
                : 'Disconnect Wallet'
            }
          />
        </View>
        {connectToWalletStatus == 'Connected' && (
          <View style={styles.section}>
            <Button
              containerStyle={{
                width: 200,
              }}
              onPress={() =>
                navigation.navigate(AppNavigationNames.CreateDIDScreen)
              }
              title="Link DID"
            />
          </View>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 30,
    paddingTop: 30,
    alignItems: 'center',
    width: '100%',
  },
})
