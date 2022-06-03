import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { FxButton } from '@functionland/component-library';
import { ThemeProvider } from '@shopify/restyle';
import { fxLightTheme, fxDarkTheme } from '@functionland/component-library';

export const App = () => {
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(false);
  const onPressHandler = React.useCallback(() => {
    setIsDarkTheme((prev) => !prev);
  }, [setIsDarkTheme]);

  return (
    <ThemeProvider theme={isDarkTheme ? fxDarkTheme : fxLightTheme}>
      <AppContent onPress={onPressHandler} />
    </ThemeProvider>
  );
};

type AppContentProps = {
  onPress: () => void;
};

const AppContent = ({ onPress }: AppContentProps) => {
  return (
    <NavigationContainer>
      <SafeAreaView>
        <FxButton
          testID="app-name"
          title="Box App"
          color="primary"
          onPress={onPress}
        />
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
