import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Button, CheckBox, Icon, Input, Text } from '@rneui/themed'

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { HDKEY } from '@functionland/fula-sec'
import { useSetRecoilState } from 'recoil'

import * as Keychain from '../../utils/keychain'
import { Header, HeaderArrowBack } from '../../components/header'
import { Screen } from '../../components'
import { RootStackParamList, AppNavigationNames } from '../../navigators'
import {
  fulaPeerIdState,
  dIDCredentialsState,
  fulaAccountState,
} from '../../store'
import { useSDK } from '@metamask/sdk-react'
import { fula, chainApi } from '@functionland/react-native-fula'
import { DeviceUtils, KeyChain, Helper } from '../../utils'
import { useMetaMask } from '../../contexts/MetaMaskContext';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';

type Props = NativeStackScreenProps<
  RootStackParamList,
  AppNavigationNames.BoxAddUpdate
>

export const CreateDIDScreen: React.FC<Props> = ({ navigation, route }) => {
  const { personalSign, isLinking, cancelSign } = useMetaMask();
  const [signatureData, setSignatureData] = useState<string>('');
  const setDIDCredentialsState = useSetRecoilState(dIDCredentialsState)
  const setFulaPeerIdState = useSetRecoilState(fulaPeerIdState)
  const setFulaAccount = useSetRecoilState(fulaAccountState)
  const [iKnow, setIKnow] = useState(false)
  const [passwod, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const signaturePromiseRef = useRef<{
    resolve: (value: string | null) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const cancelLinking = () => {
    cancelSign();
  };
  const { isConnected } = useWalletConnectModal();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Screen focused - checking for pending signature");
    });

    return unsubscribe;
  }, [navigation]);

  const handleLinkPassword = async (passwordInput: string) => {
    try {
      const ed = new HDKEY(passwordInput);
      const chainCode = ed.chainCode;
      console.log("chainCode is: "+chainCode);

      console.log('before signing...');
      const sig = await personalSign(chainCode);

      if (!sig) {
        throw new Error('Sign failed');
      }

      console.log('Signature: ', sig);
      setSignatureData(sig);
      console.log('after signing...');
      return sig;
    } catch (err) {
      console.log("error in signing", err);
      Toast.show({
        text1: 'Error',
        text2: 'Unable to sign the wallet address!',
        position: 'bottom',
        bottomOffset: 0,
      });
      return null;
    }
  };
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

      let sig = await handleLinkPassword(passwod)
      if (!sig) {
        throw new Error('could not get the signature')
      }
      const walletSignature = sig.toString()
      //Create Fotos app peerId
      const keyPair = Helper.getMyDIDKeyPair(passwod, walletSignature)
      const secretSeed = keyPair.secretKey.toString()
      await fula.shutdown()
      const peerId = await fula.newClient(
        secretSeed, //bytes of the privateKey of did identity in string format
        `${DeviceUtils.DocumentDirectoryPath}/wnfs`, // leave empty to use the default temp one
        '',
        'noop',
        true,
        true,
        true,
      )
      console.log("PeerId created: "+peerId)
      if (peerId) {
        const fulaPeerId = await KeyChain.save(
          'peerId',
          peerId,
          KeyChain.Service.FULAPeerIdObject,
        )
        if (fulaPeerId) setFulaPeerIdState(fulaPeerId)
        if (secretSeed) {
          const fulaAccountSeed = await chainApi.createHexSeedFromString(
            secretSeed,
          )
          if (fulaAccountSeed) {
            await KeyChain.save(
              'fulaAccountSeed',
              fulaAccountSeed,
              KeyChain.Service.FULAAccountSeedObject,
            )
            const fulaAccount = chainApi.getLocalAccount(fulaAccountSeed)
            if (fulaAccount?.account) {
              if (fulaAccount?.account) setFulaAccount(fulaAccount?.account)
            } else {
              Toast.show({
                type: 'error',
                text1: 'Unable to create account',
                position: 'bottom',
                bottomOffset: 0,
              })
              return
            }
          } else {
            Toast.show({
              type: 'error',
              text1: 'Unable to create account seed',
              position: 'bottom',
              bottomOffset: 0,
            })
            return
          }
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Unable to create FxFotos peerId',
          position: 'bottom',
          bottomOffset: 0,
        })
        return
      }
      const passwordCredentials = await Keychain.save(
        passwod,
        walletSignature,
        Keychain.Service.DIDCredentials,
      )
      if (passwordCredentials) {
        setDIDCredentialsState(passwordCredentials)
        navigation.reset({
          index: 1,
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
    } finally {

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
          <Icon name="key-link" type="material-community" size={100} />
        </View>
        <View style={styles.section}>
          <Text style={styles.textCenter}>
            You need to link a password to your wallet to generate your DID
          </Text>
        </View>
        {isConnected && (
          <>
          <View style={styles.section}>
            <Input
              returnKeyType="done"
              placeholder="Enter your password"
              containerStyle={{
                marginTop: 20,
              }}
              textContentType="password"
              secureTextEntry={!showPassword}
              rightIcon={{
                name: showPassword ? 'visibility-off' : 'visibility',
                color: 'white',
                onPress: () => setShowPassword(!showPassword),
              }}
              style={{ textAlign: 'center' }}
              onChangeText={text => setPassword(text)}
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
          </>
        )}
        <View style={styles.section}>
        <Button
          disabled={isConnected && (!iKnow || !passwod?.length)}
          onPress={isLinking ? cancelLinking : signPassword}
        >
          {isLinking && <ActivityIndicator />}
          {isLinking ? ' Cancel' : !isConnected ? 'Connect' : 'Link password'}
        </Button>
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
