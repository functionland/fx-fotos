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
import * as React from "react"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import {
  RecoilRoot,
} from 'recoil';
import { initFonts } from "./theme/fonts" // expo
import * as storage from "./utils/storage"
import { useBackButtonHandler, AppNavigator, canExit, useNavigationPersistence } from "./navigators"
import { ToggleStorybook } from "../storybook/toggle-storybook"
import { ErrorBoundary } from "./screens/error/error-boundary"
import * as MediaLibrary from "expo-media-library"

// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

/**
 * This is the root component of our app.
 */
function App() {
  useBackButtonHandler(canExit)
  const {
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [, getPermissions] = MediaLibrary.usePermissions()
  // Kick off initial async loading actions, like loading fonts and RootStore
  React.useEffect(() => {
    ; (async () => {
      await getPermissions()
      await initFonts()
    })()
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!isNavigationStateRestored) return null

  // otherwise, we're ready to render the app
  return (
    <ToggleStorybook>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary catchErrors={"prod"}>
          <RecoilRoot>
            <AppNavigator onStateChange={onNavigationStateChange} />
          </RecoilRoot>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ToggleStorybook>
  )
}

export default App
