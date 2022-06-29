import React from 'react';
import { ThemeProvider } from '@shopify/restyle';
import { fxLightTheme, fxDarkTheme } from '@functionland/component-library';
import { RootNavigator } from '../navigation/Root.navigator';
import { WalletConnectProvider } from '@walletconnect/react-native-dapp/dist/providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavContainer } from '../navigation/NavContainer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

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
        <GestureHandlerRootView style={styles.flex1}>
          <AppContent />
        </GestureHandlerRootView>
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

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});

export default App;
