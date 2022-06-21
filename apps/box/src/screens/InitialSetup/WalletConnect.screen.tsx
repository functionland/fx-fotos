import { FxButton } from '@functionland/component-library';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import React from 'react';
import { FxBox, FxText } from '@functionland/component-library';
import { useInitialSetupNavigation } from '../../hooks/useTypedNavigation';
import { Image, StyleSheet } from 'react-native';

export const WalletConnectScreen = () => {
  const navigation = useInitialSetupNavigation();
  const walletConnect = useWalletConnect();
  const walletAction = walletConnect.connected
    ? 'Disconnect'
    : 'Connect to Wallet';

  const handleConnectWallet = async () => {
    try {
      if (!walletConnect.connected) {
        await walletConnect.connect();
      } else {
        await walletConnect.killSession();
      }
    } catch (err) {}
  };

  return (
    <FxBox flex={1}>
      <FxButton onPress={handleConnectWallet}>{walletAction}</FxButton>
      <FxButton onPress={() => navigation.navigate('Setup Complete')}>
        Nav to Complete
      </FxButton>
      {walletConnect.connected && <WalletDetails />}
    </FxBox>
  );
};

export const WalletDetails = () => {
  const walletConnect = useWalletConnect();

  return (
    <FxBox flex={1} padding="m">
      <FxText variant="body">Wallet Details</FxText>
      <FxText variant="body" paddingVertical="m">
        Connected to {walletConnect.peerMeta.name} wallet
      </FxText>
      <Image
        source={{
          uri: walletConnect.peerMeta.icons[0],
        }}
        style={styles.image}
      />
    </FxBox>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
  },
});
