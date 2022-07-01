import { FxButton } from '@functionland/component-library';
import React, { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, SafeAreaView } from 'react-native';
import { useIsConnectedToBox } from '../../hooks/useIsConnectedToBox';
import { useInitialSetupNavigation } from '../../hooks/useTypedNavigation';

export const WelcomeScreen = () => {
  const navigation = useInitialSetupNavigation();
  const isAndroid = Platform.OS === 'android';
  const [hasLocationPermission, setHasLocationPermission] = useState(
    !isAndroid
  );
  const [hasCheckedLocationPermission, setHasCheckedLocationPermission] =
    useState(!isAndroid);
  const isConnectedToBox = useIsConnectedToBox();

  const onConnectToBox = () => {
    if (hasLocationPermission) {
      if (isConnectedToBox) {
        navigation.navigate('Setup Wifi');
      } else {
        navigation.navigate('Connect To Box');
      }
    } else {
      /**
       * @todo: Add Location Permission screen or dialogue for android
       */
      // navigation.navigate('Location Permission');
    }
  };

  useEffect(() => {
    if (isAndroid && !hasLocationPermission) {
      (async () => {
        const isGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasLocationPermission(isGranted);
        setHasCheckedLocationPermission(true);
      })();
    }
  }, [isAndroid, hasLocationPermission, hasCheckedLocationPermission]);

  return (
    <SafeAreaView>
      <FxButton
        testID="app-name"
        onPress={() => navigation.navigate('Wallet Connect')}
      >
        Setup Wallet
      </FxButton>
      <FxButton
        testID="app-name"
        onPress={onConnectToBox}
        disabled={!hasCheckedLocationPermission}
      >
        Connect To Box
      </FxButton>
    </SafeAreaView>
  );
};
