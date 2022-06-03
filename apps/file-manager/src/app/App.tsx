import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { ThemeProvider } from '@shopify/restyle';
import { FxButton, fxLightTheme } from '@functionland/component-library';

export const App = () => {
  return (
    <ThemeProvider theme={fxLightTheme}>
      <NavigationContainer>
        <SafeAreaView>
          <FxButton
            testID="app-name"
            title="File Manager App"
            color="primary"
          />
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
