import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, Text } from 'react-native';

export const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView>
        <Text testID="app-name">Box App</Text>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
