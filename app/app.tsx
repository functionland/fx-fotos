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
import "./i18n"
import "./utils/ignore-warnings"
import React, { useRef } from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { RecoilRoot } from "recoil"
import { ThemeProvider as RneThemeProvider } from '@rneui/themed';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { initFonts } from "./theme/fonts" // expo
import * as storage from "./utils/storage"
import { useBackButtonHandler, AppNavigator, canExit, useNavigationPersistence } from "./navigators"
import { ToggleStorybook } from "../storybook/toggle-storybook"
import { ErrorBoundary } from "./screens/error/error-boundary"
import * as MediaLibrary from "expo-media-library"
import { ThemeProvider } from './theme';
import { RneLightTheme, RneDarkTheme } from "./theme"
import NetInfo from "@react-native-community/netinfo";
import { AddBoxs, uploadAssetsInBackground } from "./services/sync-service"
import { SyncService } from "./services"

// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

/**
 * This is the root component of our app.
 */


function App() {
  const scheme = useColorScheme();
  const netInfoTimer = useRef(null);
  useBackButtonHandler(canExit)
  const { onNavigationStateChange, isRestored: isNavigationStateRestored } =
    useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [, getPermissions] = MediaLibrary.usePermissions()
  // Kick off initial async loading actions, like loading fonts and RootStore
  React.useEffect(() => {
    ; (async () => {
      await getPermissions()
      await initFonts()
      await SyncService.initBackgroundFetch();
    })();
    // Subscribe
    const unsubscribeNetInfo = subscribeNetInfo();
    return () => {
      // Unsubscribe
      unsubscribeNetInfo();
    }
  }, [])
  const subscribeNetInfo = () => {
    return NetInfo.addEventListener(state => {
      if (netInfoTimer.current)
        clearTimeout(netInfoTimer.current);
      netInfoTimer.current = setTimeout(async () => {
        if (state.isConnected)
          await AddBoxs();
        uploadAssetsInBackground();
      }, 1000);
    });
  }


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
        <RneThemeProvider theme={scheme === "dark" ? RneDarkTheme : RneLightTheme}>
          <ThemeProvider>
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
              <ErrorBoundary catchErrors={"prod"}>
                <RecoilRoot>
                  <WalletConnectProvider
                    redirectUrl='fotos://'
                    storageOptions={{
                      asyncStorage: AsyncStorage,
                    }}>
                    <AppNavigator onStateChange={onNavigationStateChange} />
                  </WalletConnectProvider>
                </RecoilRoot>
              </ErrorBoundary>
            </SafeAreaProvider>
          </ThemeProvider>
        </RneThemeProvider>
    </GestureHandlerRootView>

  )
}

export default App
