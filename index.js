// This is the first file that ReactNative will run when it starts up.
//
// We jump out of here immediately and into our main entry point instead.
//
// It is possible to have React Native load our main module first, but we'd have to
// change that in both AppDelegate.m and MainApplication.java.  This would have the
// side effect of breaking other tooling like mobile-center and react-native-rename.
//
// It's easier just to leave it here.
import 'node-libs-react-native/globals.js'
import './shim.js'
import 'react-native-get-random-values'
import 'text-encoding-polyfill'
import 'react-native-url-polyfill/auto'
import { AppRegistry } from 'react-native'
import App from './app/app'
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://c705a33a416c4ba7a24bf6b5febcf2e4@o4506985840312320.ingest.us.sentry.io/4506986575298560',
});

AppRegistry.registerComponent('fotos', () => App)

export default Sentry.wrap(App);
