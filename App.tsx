import React from 'react';
import AppNavigation from './navigation/AppNavigation';
import {RecoilRoot} from 'recoil';
import {LogBox} from 'react-native';
import {RootSiblingParent} from 'react-native-root-siblings';
import Borg from '@functionland/rn-borg/src/index';
import MediasManager from "./components/MediasManager";
import Sync from "./components/Sync";
import ScrollContextProvider from "./components/Shared/ScrollContext";

LogBox.ignoreLogs(['Setting a timer']);

const App = () => {
	return (
		<RecoilRoot>
			<RootSiblingParent>
				<Borg>
					<Sync/>
					<MediasManager/>
					<ScrollContextProvider>
						<AppNavigation/>
					</ScrollContextProvider>
				</Borg>
			</RootSiblingParent>
		</RecoilRoot>
	);
};


export default App;
