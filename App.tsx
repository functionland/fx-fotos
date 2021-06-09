import React from 'react';
import AppNavigation from './navigation/AppNavigation';
import {
  RecoilRoot,
} from 'recoil';

const App = () => {
  return (
    <RecoilRoot>
      <AppNavigation />
    </RecoilRoot>
  );
};

export default App;
