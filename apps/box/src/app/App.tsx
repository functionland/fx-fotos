import React from 'react';
import { ThemeProvider } from '@shopify/restyle';
import { fxLightTheme, fxDarkTheme } from '@functionland/component-library';
import { RootNavigator } from '../navigation/Root.navigator';
import { WalletConnectProvider } from '@walletconnect/react-native-dapp/dist/providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavContainer } from '../navigation/NavContainer';

export const App = () => {
  const [isDarkTheme] = React.useState<boolean>(false);

  return (
    <ThemeProvider theme={isDarkTheme ? fxDarkTheme : fxLightTheme}>
      <WalletConnectProvider
        redirectUrl={'yourappscheme://'}
        storageOptions={{
          // @ts-ignore
          asyncStorage: AsyncStorage,
        }}
      >
        <AppContent />
      </WalletConnectProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  return (
    <NavContainer>
      <RootNavigator />
    </NavContainer>
  );
};

export default App;
