import { FxText } from '@functionland/component-library';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import { getWifiStatus, putApDisable } from '../../api/wifi';
import { DEFAULT_NETWORK_NAME } from '../../hooks';

enum NetworkStatus {
  Connected = 'connected',
  Connecting = 'connecting',
  CheckConnection = 'check-connection',
  FailedConnection = 'failed-connection',
  Disconnected = 'disconnected',
}

export const CheckConnectionScreen = ({ route }) => {
  const [status, setStatus] = useState(NetworkStatus.Connecting);
  const { ssid } = route.params;

  const confirmNetworkConnection = useCallback(async () => {
    try {
      const {
        data: { status: wifiStatus },
      } = await getWifiStatus();
      setStatus(wifiStatus);
      if (wifiStatus === NetworkStatus.Connected) {
        // eslint-disable-next-line no-alert
        alert('All done\nYour device is connected with success!');
        putApDisable();
      }
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error.response ? error.response.data.message : error.message);
    }
  }, [setStatus]);

  const connectToBox = useCallback(async (callback: () => void) => {
    await WifiManager.connectToProtectedSSID(DEFAULT_NETWORK_NAME, null, false);
    callback();
  }, []);

  const checkNetwork = useCallback(async () => {
    WifiManager.getCurrentWifiSSID().then((actualSsid) => {
      if (actualSsid === DEFAULT_NETWORK_NAME) {
        setStatus(NetworkStatus.CheckConnection);
        confirmNetworkConnection();
      } else {
        setStatus(NetworkStatus.Connecting);
        connectToBox(checkNetwork);
      }
    });
  }, [confirmNetworkConnection, connectToBox]);

  useEffect(() => {
    const timeout = setTimeout(checkNetwork, 10000);
    return () => clearTimeout(timeout);
  }, [checkNetwork]);

  const statusMessage = useMemo(() => {
    switch (status) {
      case NetworkStatus.Connected:
        return `Successfully connected to ${ssid}.`;
      case NetworkStatus.CheckConnection:
        return `Verifying connection...`;
      case NetworkStatus.FailedConnection:
        return `Couldn't connect with ${ssid}.`;
      case NetworkStatus.Disconnected:
        return `Couldn't connect with ${ssid}. Please try again.`;
      case NetworkStatus.Connecting:
      default:
        return `Connecting with ${ssid}...`;
    }
  }, [status, ssid]);

  return (
    <SafeAreaView>
      <FxText variant="body" margin="m" color="primary">
        Verifying connection with {ssid}
      </FxText>
      <FxText variant="body" margin="m" color="secondary">
        {statusMessage}
      </FxText>
    </SafeAreaView>
  );
};
