import React, { useEffect, useState, } from "react"
import { StyleSheet, View, Image, Alert, ActivityIndicator } from "react-native"
import { Avatar, Button, Card, Icon, ListItem, Text } from "@rneui/themed"
import { useWalletConnect } from "@walletconnect/react-native-dapp"
import * as Keychain from 'react-native-keychain';
import Toast from "react-native-toast-message"

import { Screen } from "../../components"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Header, HeaderArrowBack } from "../../components/header"
import { AppNavigationNames, RootStackParamList } from "../../navigators"
import { SharedElement } from "react-navigation-shared-element"
import * as helper from "../../utils/helper"
type Props = NativeStackScreenProps<RootStackParamList, AppNavigationNames.BoxList>;
type ConnectToWalletStep = "None" | "Connecting" | "Signing"

export const AccountScreen: React.FC<Props> = ({ navigation }) => {
  const walletConnector = useWalletConnect()
  const [signature, setSignature] = useState(null);
  const [connectToWalletStep, setConnectToWalletStep] = useState<ConnectToWalletStep>("None");

  useEffect(() => {
    getGenericPassword()
  }, [])
  useEffect(() => {
    if (walletConnector.session.connected && signature === "") {
      signWalletAddress();
    }
  }, [walletConnector])
  const getGenericPassword = async () => {
    const gPassword = await Keychain.getGenericPassword();
    if (gPassword) {
      setSignature((gPassword as Keychain.UserCredentials).password)
    } else
      setSignature("")
  }

  const connectToWallet = async () => {
    try {
      if (connectToWalletStep !== "None") {
        setConnectToWalletStep("None")
        return;
      }
      setConnectToWalletStep("Connecting");
      await walletConnector.connect();
      setConnectToWalletStep("Signing");

    } catch (error) {
      console.log(error)
      setConnectToWalletStep("None");
      Toast.show({
        type: 'error',
        text1: 'Unable to connect to wallet',
        text2: `${error}`,
        position: "bottom",
        bottomOffset: 0,
      });
    }
  }
  const signWalletAddress = async () => {
    try {
      const messageBytes = new TextEncoder().encode(walletConnector?.accounts[0]);
      if (!walletConnector.session?.connected)
        await walletConnector.createSession()
      const signature = await walletConnector.signPersonalMessage([messageBytes, walletConnector?.accounts[0]])
      Keychain.setGenericPassword("signature", signature);
      setSignature(signature)
      Toast.show({
        type: 'success',
        text1: 'Your DID created successfully!',
        position: "bottom",
        bottomOffset: 0,
      });
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: 'Unable to sign the wallet address!',
        text2: `${error}`,
        position: "bottom",
        bottomOffset: 0,
      });
    } finally {
      setConnectToWalletStep("None");
    }
  }
  const disconnectWallet = async () => {
    Alert.alert("Disconnect wallet!",
      "Are you sure want to disconnect your wallet?",
      [{
        text: "No",
        cancelable: true
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await walletConnector.killSession();
            await Keychain.resetGenericPassword();
          } catch (error) {
            console.log(error)
            Toast.show({
              type: 'error',
              text1: 'Unable to disconnect wallet',
              position: "bottom",
              bottomOffset: 0,
            });
          } finally {
            setSignature("")
            setConnectToWalletStep("None")
          }
        }
      }])

  }
  const renderHeader = () => {
    return (<Header
      centerComponent={<Text lineBreakMode="tail" h4 >Account</Text>}
      leftComponent={<HeaderArrowBack navigation={navigation} />}
    />)
  }
  return (
    <Screen
      preset="scroll"
      unsafe
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}

      <View style={styles.container}>
        <SharedElement id="AccountAvatar">
          {walletConnector.connected ? <Avatar
            containerStyle={{ backgroundColor: "gray", width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" }}

            ImageComponent={() => <Image
              source={walletConnector.peerMeta?.icons?.[0].endsWith(".svg")
                ? helper.getWalletImage(walletConnector.peerMeta?.name) :
                { uri: walletConnector.peerMeta?.icons?.[0] }
              }
              style={{
                height: 90,
                width: 90,

              }}

              resizeMode="contain"
            />}

          /> : <Avatar
            containerStyle={styles.avatarLarge}
            icon={{ name: "account-alert", type: "material-community", size: 84 }}
            rounded={true}
          />}
        </SharedElement>

        {connectToWalletStep != "None" &&
          <View style={styles.section}>
            <ActivityIndicator size="large" />
            <Text>{connectToWalletStep === "Connecting" ? 'Connecting to wallet' : 'Please sign your wallet address'}</Text>
          </View>
        }

        {walletConnector.connected ?
          <View style={styles.section}>
            <Text>{walletConnector.peerMeta?.name}</Text>
            <Text ellipsizeMode="tail">{walletConnector.accounts?.[0]}</Text>
            <View style={styles.section}>
              {!signature ? <Button title="Sign your address" onPress={signWalletAddress} /> : null}
              <Button title="Disconnect" onPress={disconnectWallet} />
            </View>
          </View>
          :
          <View style={styles.section}>
            <Button
              onPress={connectToWallet}
              title={connectToWalletStep == "None" ? "Connect your wallet" : "Cancel"}
            />
          </View>
        }
      </View>
      <View>
        <Card containerStyle={{ borderWidth: 0 }}>
          <Card.Title style={{ textAlign: "left" }}>SETTINGS</Card.Title>
          <ListItem key="Boxes" bottomDivider onPress={() => navigation.navigate(AppNavigationNames.BoxList)}>
            <Icon type="material-community" name="alpha-f-box-outline" />
            <ListItem.Content>
              <ListItem.Title lineBreakMode="tail">Boxes</ListItem.Title>
              <ListItem.Subtitle lineBreakMode="tail">Add your box address</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        </Card>
      </View>

    </Screen >
  )
}

const styles = StyleSheet.create({
  screen: {
    //alignItems: "center",
    paddingTop: 100
  },
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: "center"
  },
  section: {
    paddingTop: 20,
    alignItems: "center"
  },
  card: {
    flex: 1,
    padding: 10
  },
  cardImage: {
    aspectRatio: 1,
    width: '100%',
    flex: 1,
    marginBottom: 8,
    borderRadius: 15
  },
  avatarLarge: {
    backgroundColor: "gray",
    width: 100,
    height: 100,
    borderRadius: 50
  }
})