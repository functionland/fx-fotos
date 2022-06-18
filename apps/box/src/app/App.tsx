import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { FxButton, FxTheme } from '@functionland/component-library';
import { createBox, ThemeProvider } from '@shopify/restyle';
import { fxLightTheme, fxDarkTheme } from '@functionland/component-library';
import { WalletConnectProvider } from '@walletconnect/react-native-dapp/dist/providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWalletConnect } from '@walletconnect/react-native-dapp';

const RestyleBox = createBox<FxTheme>();

export const App = () => {
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(false);
  const onPressHandler = React.useCallback(() => {
    setIsDarkTheme((prev) => !prev);
  }, [setIsDarkTheme]);

  return (
    <ThemeProvider theme={isDarkTheme ? fxDarkTheme : fxLightTheme}>
      <WalletConnectProvider
        redirectUrl={'yourappscheme://'}
        storageOptions={{
          // @ts-ignore
          asyncStorage: AsyncStorage,
        }}
      >
        <AppContent onPress={onPressHandler} />
      </WalletConnectProvider>
    </ThemeProvider>
  );
};

type AppContentProps = {
  onPress: () => void;
};

const AppContent = ({ onPress }: AppContentProps) => {
  const walletConnect = useWalletConnect();

  const connectWallet = () => {
    try {
      walletConnect.connect();
    } catch (error) {}
  };

  return (
    <NavigationContainer>
      <SafeAreaView>
        <RestyleBox padding="m">
          <FxButton
            testID="app-name"
            title="Box App"
            color="primary"
            onPress={onPress}
          />
        </RestyleBox>
        <RestyleBox padding="m">
          <FxButton
            title="Connect Wallet"
            color="primary"
            onPress={connectWallet}
          />
        </RestyleBox>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
