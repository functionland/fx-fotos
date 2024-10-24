/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
import './utils/ignore-warnings'
import React, { useRef } from 'react'
import { useColorScheme, Linking } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'
import { RecoilRoot } from 'recoil'
import { ThemeProvider as RneThemeProvider } from '@rneui/themed'

import * as storage from './utils/storage'
import {
  useBackButtonHandler,
  AppNavigator,
  canExit,
  useNavigationPersistence,
} from './navigators'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COMM_SERVER_URL, INFURA_API_KEY } from './utils/walletConnectConifg'
import { ErrorBoundary } from './screens/error/error-boundary'
import { ThemeProvider, RneLightTheme, RneDarkTheme } from './theme'
import BackgroundTimer from 'react-native-background-timer'
import { MetaMaskSDKProvider } from './contexts/MetaMaskContext';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

// TODO how to properly make sure we only try to open link when the app is active?
// current problem is that sdk declaration is outside of the react scope so I cannot directly verify the state
// hence usage of a global variable.
const canOpenLink = true

// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'

/**
 * This is the root component of our app.
 */

function App() {
  const scheme = useColorScheme()
  const netInfoTimer = useRef(null)
  useBackButtonHandler(canExit)
  const { onNavigationStateChange, isRestored: isNavigationStateRestored } =
    useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  // Kick off initial async loading actions, like loading fonts and RootStore
  // React.useEffect(() => {
  //   ;(async () => {
  //     await SyncService.initBackgroundFetch()
  //   })()
  //   // Subscribe
  //   const unsubscribeNetInfo = subscribeNetInfo()
  //   return () => {
  //     // Unsubscribe
  //     unsubscribeNetInfo()
  //   }
  // }, [])
  // const subscribeNetInfo = () =>
  //   NetInfo.addEventListener(state => {
  //     if (netInfoTimer.current) clearTimeout(netInfoTimer.current)
  //     netInfoTimer.current = setTimeout(async () => {
  //       if (state.isConnected) await AddBoxs()
  //       uploadAssetsInBackground()
  //     }, 1000)
  //   })

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!isNavigationStateRestored) return null
  const projectId = '56755e4e110a783c85b3e6f74beedb2e';

  const providerMetadata = {
    name: 'FxFotos',
    description: 'A Decentralized Galley app',
    url: 'https://fx.land/',
    icons: ['https://your-project-logo.com/'],
    redirect: {
      native: 'fotos://',
      universal: 'fx.land'
    }
  };

  // otherwise, we're ready to render the app
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <MetaMaskSDKProvider>
          <RneThemeProvider
            theme={scheme === 'dark' ? RneDarkTheme : RneLightTheme}
          >
            <ThemeProvider>
              <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <ErrorBoundary catchErrors="prod">
                  <RecoilRoot>
                    <AppNavigator onStateChange={onNavigationStateChange} />
                  </RecoilRoot>
                </ErrorBoundary>
              </SafeAreaProvider>
            </ThemeProvider>
          </RneThemeProvider>
        </MetaMaskSDKProvider>
        <WalletConnectModal
          projectId={projectId}
          providerMetadata={providerMetadata}
        ></WalletConnectModal>
    </GestureHandlerRootView>
  )
}

export default App
