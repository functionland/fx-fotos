import { AppRegistry, LogBox } from 'react-native';
import App from './app/App';
require('node-libs-react-native/globals');

AppRegistry.registerComponent('Box', () => App);

LogBox.ignoreLogs(['Require cycle: ../../node_modules/']);
