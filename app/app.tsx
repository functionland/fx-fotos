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
import {
  MetaMaskProvider,
  SDKConfigProvider,
  useSDKConfig,
} from '@metamask/sdk-react'
import { COMM_SERVER_URL, INFURA_API_KEY } from './utils/walletConnectConifg'
import { ErrorBoundary } from './screens/error/error-boundary'
import { ThemeProvider, RneLightTheme, RneDarkTheme } from './theme'
import BackgroundTimer from 'react-native-background-timer'
import { MetaMaskSDKProvider } from './contexts/MetaMaskContext';

// TODO how to properly make sure we only try to open link when the app is active?
// current problem is that sdk declaration is outside of the react scope so I cannot directly verify the state
// hence usage of a global variable.
const canOpenLink = true

// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'

const openDeeplink = (link: string, _target?: string) => {
  console.debug(`App::openDeepLink() ${link}`);
  if (canOpenLink) {
    Linking.openURL(link);
  } else {
    console.debug(
      'useBlockchainProiver::openDeepLink app is not active - skip link',
      link
    );
  }
};

const WithSDKConfig = ({ children }: { children: React.ReactNode }) => {
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    debug,
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskProvider
      debug={true}
      sdkOptions={{
        // communicationServerUrl: socketServer,
        // TODO: change to enableAnalytics when updating the SDK version
        // enableDebug: true,
        infuraAPIKey,
        readonlyRPCMap: {
          '0x539': process.env.NEXT_PUBLIC_PROVIDER_RPCURL ?? '',
        },
        logging: {
          developerMode: true,
          plaintext: true,
        },
        openDeeplink: openDeeplink,
        timer: BackgroundTimer,
        useDeeplink,
        checkInstallationImmediately: false,
        storage: {
          enabled: true,
        },
        dappMetadata: {
          name: 'land.fx.fotos',
          url: 'https://fx.land',
          scheme: 'fotos',
          iconUrl:
            'https://ipfs.cloud.fx.land/gateway/bafkreigl4s3qehoblwqglo5zjjjwtzkomxg4i6gygfeqk5s5h33m5iuyra',
        },
        i18nOptions: {
          enabled: true,
        },
      }}
    >
      <MetaMaskSDKProvider>
        {children}
      </MetaMaskSDKProvider>
    </MetaMaskProvider>
  );
};

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

  // otherwise, we're ready to render the app
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SDKConfigProvider
        initialSocketServer={COMM_SERVER_URL}
        initialInfuraKey={INFURA_API_KEY}
      >
        <WithSDKConfig>
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
        </WithSDKConfig>
      </SDKConfigProvider>
    </GestureHandlerRootView>
  )
}

export default App
