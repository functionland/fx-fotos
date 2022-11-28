import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native'
import { Avatar, Button, Card, Icon, ListItem, Text } from '@rneui/themed'
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import * as Keychain from 'react-native-keychain'
import Toast from 'react-native-toast-message'
import { FulaDID } from '@functionland/fula-sec'

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SharedElement } from 'react-navigation-shared-element'
import { Screen } from '../../components'
import {
  Header,
  HeaderArrowBack,
  HeaderRightContainer,
} from '../../components/header'
import { AppNavigationNames, RootStackParamList } from '../../navigators'
import * as helper from '../../utils/helper'

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.AccountScreen
>
type ConnectToWalletStep = 'None' | 'Connecting' | 'Signing'

export const AccountScreen: React.FC<Props> = ({ navigation }) => {
  const walletConnector = useWalletConnect()
  const [userCredentials, setUserCredentials] = useState<
    Keychain.UserCredentials | undefined | null
  >(null)
  const [connectToWalletStep, setConnectToWalletStep] =
    useState<ConnectToWalletStep>('None')

  useEffect(() => {
    getGenericPassword()
  }, [])
  useEffect(() => {
    if (walletConnector.session.connected && userCredentials === undefined) {
      signWalletAddress()
    }
  }, [walletConnector])
  const getGenericPassword = async () => {
    const gPassword = await Keychain.getGenericPassword()
    if (gPassword) {
      setUserCredentials(gPassword as Keychain.UserCredentials)
    } else setUserCredentials(undefined)
  }

  const connectToWallet = async () => {
    navigation.navigate(AppNavigationNames.ConnectWalletScreen)
  }
  const signWalletAddress = async () => {
    navigation.navigate(AppNavigationNames.CreateDIDScreen)
    return
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

      const fulaDID = new FulaDID()
      await fulaDID.create(walletSignature, walletSignature)

      const credentials = Keychain.setGenericPassword(
        fulaDID?.authDID,
        walletSignature,
      )
      if (credentials) {
        setUserCredentials({
          username: fulaDID?.authDID,
          password: walletSignature,
        })
        Toast.show({
          type: 'success',
          text1: 'Your DID created successfully!',
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
    } finally {
      setConnectToWalletStep('None')
    }
  }
  const disconnectWallet = async () => {
    Alert.alert(
      'Disconnect wallet!',
      'Are you sure want to disconnect your wallet?',
      [
        {
          text: 'No',
          cancelable: true,
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await walletConnector.killSession()
              await Keychain.resetGenericPassword()
            } catch (error) {
              console.log(error)
              Toast.show({
                type: 'error',
                text1: 'Unable to disconnect wallet',
                position: 'bottom',
                bottomOffset: 0,
              })
            } finally {
              setUserCredentials(undefined)
              setConnectToWalletStep('None')
            }
          },
        },
      ],
    )
  }
  const shareDID = async () => {
    try {
      if (userCredentials?.username) {
        await Share.share({
          title: 'FxFotos | Did identity',
          message: userCredentials.username,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Account
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
      rightComponent={
        <HeaderRightContainer>
          {walletConnector?.connected && (
            <Icon
              type="material-community"
              size={28}
              style={styles.headerIcon}
              name="account-off-outline"
              onPress={disconnectWallet}
            />
          )}
          {userCredentials?.username && (
            <Icon
              type="material-community"
              size={26}
              style={styles.headerIcon}
              name="share-variant-outline"
              onPress={shareDID}
            />
          )}
        </HeaderRightContainer>
      }
    />
  )
  return (
    <Screen
      preset="scroll"
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}

      <View style={styles.container}>
        <SharedElement id="AccountAvatar">
          {walletConnector.connected ? (
            <Avatar
              containerStyle={{
                backgroundColor: 'gray',
                width: 100,
                height: 100,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ImageComponent={() => (
                <Image
                  source={
                    walletConnector.peerMeta?.icons?.[0].endsWith('.svg')
                      ? helper.getWalletImage(walletConnector.peerMeta?.name)
                      : {
                          uri: walletConnector.peerMeta?.icons?.[0],
                        }
                  }
                  style={{
                    height: 90,
                    width: 90,
                  }}
                  resizeMode="contain"
                />
              )}
            />
          ) : (
            <Avatar
              containerStyle={styles.avatarLarge}
              icon={{
                name: 'account-alert',
                type: 'material-community',
                size: 84,
              }}
              rounded
            />
          )}
        </SharedElement>

        {connectToWalletStep != 'None' && (
          <View style={styles.section}>
            <ActivityIndicator size="large" />
            <Text>
              {connectToWalletStep === 'Connecting'
                ? 'Connecting to wallet'
                : 'Please sign your wallet address'}
            </Text>
          </View>
        )}

        {walletConnector.connected ? (
          <View style={styles.section}>
            <Text>{walletConnector.peerMeta?.name}</Text>
            <Text ellipsizeMode="tail">{walletConnector.accounts?.[0]}</Text>
            <View style={styles.section}>
              {!userCredentials ? (
                <Button title="Sign your address" onPress={signWalletAddress} />
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Button
              onPress={connectToWallet}
              title={
                connectToWalletStep == 'None' ? 'Connect your wallet' : 'Cancel'
              }
            />
          </View>
        )}
      </View>
      {/* <View>
        <Card
          containerStyle={{
            borderWidth: 0,
          }}
        >
          <Card.Title
            style={{
              textAlign: 'left',
            }}
          >
            SETTINGS
          </Card.Title>
          <ListItem
            key="Boxes"
            bottomDivider
            onPress={() => navigation.navigate(AppNavigationNames.BoxList)}
          >
            <Icon type="material-community" name="alpha-f-box-outline" />
            <ListItem.Content>
              <ListItem.Title lineBreakMode="tail">Boxes</ListItem.Title>
              <ListItem.Subtitle lineBreakMode="tail">
                Add your box address
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        </Card>
      </View> */}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
  },
  section: {
    paddingTop: 20,
    alignItems: 'center',
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
  avatarLarge: {
    backgroundColor: 'gray',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerIcon: {
    marginHorizontal: 5,
  },
})
