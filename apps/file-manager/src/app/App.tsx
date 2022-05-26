import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { FxButton } from '@functionland/component-library';

export const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <FxButton title="Sample Button" />
      </SafeAreaView>
    </>
  );
};
export default App;
