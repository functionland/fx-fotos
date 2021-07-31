import React from 'react';
import 'text-encoding';
import 'react-native-get-random-values'
import 'react-native-polyfill-globals/auto';
import "react-native-wasm";
import AppNavigation from './navigation/AppNavigation';
import {
  RecoilRoot,
} from 'recoil';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Setting a timer']);

const App = () => {
  return (
    <RecoilRoot>
      <AppNavigation />
    </RecoilRoot>
  );
};

export default App;
