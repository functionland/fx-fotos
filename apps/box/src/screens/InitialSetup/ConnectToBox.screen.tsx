import { FxText } from '@functionland/component-library';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { connectToProtectedSSID } from 'react-native-wifi-reborn';
import { DEFAULT_NETWORK_NAME } from '../../hooks/useIsConnectedToBox';
import { useInitialSetupNavigation } from '../../hooks/useTypedNavigation';

export const ConnectToBoxScreen = () => {
  const navigation = useInitialSetupNavigation();
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    connectToProtectedSSID(DEFAULT_NETWORK_NAME, null, false).then(
      () => navigation.navigate('Setup Wifi'),
      () => setConnectionStatus('Unable to connect to Box.')
    );
  }, [navigation]);

  return (
    <SafeAreaView>
      <FxText variant="body" color="primary" margin="m">
        Make sure your Box is turned on and in range of your mobile device.
      </FxText>
      <FxText variant="body" color="secondary" margin="m">
        {connectionStatus}
      </FxText>
    </SafeAreaView>
  );
};
