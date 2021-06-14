import React from 'react';
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
