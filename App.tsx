import React from 'react';
import AppNavigation from './navigation/AppNavigation';
import {RecoilRoot} from 'recoil';
import {LogBox} from 'react-native';
import {RootSiblingParent} from 'react-native-root-siblings';
import Borg from '@functionland/rn-borg/src/index';


LogBox.ignoreLogs(['Setting a timer']);

const App = () => {
	return (
		<RecoilRoot>
			<RootSiblingParent>
				<Borg>
					<AppNavigation/>
				</Borg>
			</RootSiblingParent>
		</RecoilRoot>
	);
};

export default App;
