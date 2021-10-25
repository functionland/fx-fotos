import React from 'react';
import AppNavigation from './navigation/AppNavigation';
import {RecoilRoot} from 'recoil';
import {LogBox} from 'react-native';
import {RootSiblingParent} from 'react-native-root-siblings';


LogBox.ignoreLogs(['Setting a timer']);

const App = () => {
	return (
		<RecoilRoot>
			<RootSiblingParent>
				<AppNavigation/>
			</RootSiblingParent>
		</RecoilRoot>
	);
};

export default App;
