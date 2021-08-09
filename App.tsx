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
import { RootSiblingParent } from 'react-native-root-siblings';


LogBox.ignoreLogs(['Setting a timer']);

const App = () => {
  return (
    <RecoilRoot>
			<RootSiblingParent>
      	<AppNavigation />
			</RootSiblingParent>
    </RecoilRoot>
  );
};

export default App;
