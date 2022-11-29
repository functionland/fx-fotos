import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Image, Alert, Share } from 'react-native'
import { Avatar, Button, Icon, Text } from '@rneui/themed'
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import * as Keychain from '../../utils/keychain'
import Toast from 'react-native-toast-message'

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
import { useRecoilState } from 'recoil'
import { dIDCredentials } from '../../store'
import Clipboard from '@react-native-clipboard/clipboard'

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.AccountScreen
>

export const AccountScreen: React.FC<Props> = ({ navigation }) => {
  const walletConnector = useWalletConnect()
  const [dIDCredentialsState, setDIDCredentialsState] =
    useRecoilState(dIDCredentials)
  const [did, setDID] = useState(null)
  useEffect(() => {
    if (dIDCredentialsState) {
      const myDID = helper.getMyDID(
        dIDCredentialsState.username,
        dIDCredentialsState.password,
      )
      setDID(myDID)
    }
  }, [dIDCredentialsState])
  const connectToWallet = async () => {
    navigation.navigate(AppNavigationNames.ConnectWalletScreen)
  }
  const signWalletAddress = async () => {
    navigation.navigate(AppNavigationNames.CreateDIDScreen)
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
              await Keychain.reset(Keychain.Service.DIDCredentials)
            } catch (error) {
              console.log(error)
              Toast.show({
                type: 'error',
                text1: 'Unable to disconnect wallet',
                position: 'bottom',
                bottomOffset: 0,
              })
            } finally {
              setDIDCredentialsState(null)
              setDID(null)
            }
          },
        },
      ],
    )
  }
  const shareDID = async () => {
    try {
      if (did) {
        await Share.share({
          title: 'FxFotos | Did identity',
          message: did,
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
          {did && (
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

        {walletConnector.connected ? (
          <>
            <View style={styles.section}>
              <Text h4>{walletConnector.peerMeta?.name}</Text>
              <Text ellipsizeMode="tail" style={styles.textCenter}>
                {walletConnector.accounts?.[0]}
              </Text>
              <View style={styles.section}>
                {!dIDCredentialsState ? (
                  <Button title="Link DID" onPress={signWalletAddress} />
                ) : null}
              </View>
            </View>
            {did && (
              <View style={styles.section}>
                <Text h4>Your DID</Text>
                <Text ellipsizeMode="tail" style={styles.textCenter}>
                  {did}
                </Text>
                <Icon
                  name="content-copy"
                  type="material-community"
                  onPress={() => {
                    Clipboard.setString(did)
                    Toast.show({
                      type: 'success',
                      text1: 'Your DID copied to the clipboard!',
                      position: 'bottom',
                      bottomOffset: 0,
                    })
                  }}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.section}>
            <Button onPress={connectToWallet} title="Create DID" />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  textCenter: {
    paddingVertical: 20,
    textAlign: 'center',
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
