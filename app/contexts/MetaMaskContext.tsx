import React, { createContext, useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useSDK } from '@metamask/sdk-react';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Toast from 'react-native-toast-message'

interface MetaMaskContextType {
  personalSign: (message: string) => Promise<string | null>;
  isLinking: boolean;
  cancelSign: () => void;
}

const MetaMaskContext = createContext<MetaMaskContextType>({
  personalSign: async () => null,
  isLinking: false,
  cancelSign: () => {},
});

export const MetaMaskSDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sdk, error, status, rpcHistory, provider } = useSDK();
  const [isLinking, setIsLinking] = useState(false);
  const signaturePromiseRef = useRef<{
    resolve: (value: string | null) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useEffect(() => {
    console.log("MetaMaskContext mounted");
    return () => {
      console.log("MetaMaskContext unmounted");
    };
  }, []);
  const handleMetaMaskResponse = useCallback((signature: string) => {
    console.log("MetaMaskContext: Received MetaMask response:", signature);
    if (signaturePromiseRef.current) {
      signaturePromiseRef.current.resolve(signature);
    }
  }, []);
  useEffect(() => {
    if (status?.connectionStatus === 'linked' && rpcHistory) {
      const rpcHistoryKeys = Object.keys(rpcHistory).reverse();
      for (const key of rpcHistoryKeys) {
        const rpcCall = rpcHistory[key];
        if (rpcCall.result && typeof rpcCall.result === 'string' && rpcCall.result.startsWith('0x')) {
          handleMetaMaskResponse(rpcCall.result);
          break;
        }
      }
    }
  }, [error, status, rpcHistory]);

  const setupSDKListeners = useMemo(() => {
    if (sdk) {
      sdk.on('deeplink', (link: string) => {
        console.log('MetaMaskContext: Deeplink received:', link);
      });
    }
  }, [sdk]);

  useEffect(() => {
    setupSDKListeners;
  }, [setupSDKListeners]);

  useEffect(() => {
    console.log('MetaMaskContext: SDK Status Change', {
      error,
      connectionStatus: status?.connectionStatus,
      rpcHistory
    });

    if (status?.connectionStatus === 'linked' && rpcHistory) {
      const rpcHistoryKeys = Object.keys(rpcHistory).reverse();
      for (const key of rpcHistoryKeys) {
        const rpcCall = rpcHistory[key];
        console.log('MetaMaskContext: RPC Call', {
          key,
          method: rpcCall.method,
          error: rpcCall.error,
          result: rpcCall.result
        });

        if (rpcCall.result && typeof rpcCall.result === 'string' && rpcCall.result.startsWith('0x')) {
          console.log('MetaMaskContext: Found valid signature:', rpcCall.result);
          handleMetaMaskResponse(rpcCall.result);
          break;
        }
      }
    }
  }, [error, status, rpcHistory, handleMetaMaskResponse]);

  const cancelSign = useCallback(() => {
    setIsLinking(false);
    try {
      console.log("cancelSign noifee closed")
      notifee.stopForegroundService();
    } catch (e) {
      console.log('Error stopping foreground service:', e);
    }
    // Only terminate if we're not in the middle of signing
    if (status?.connectionStatus !== 'linked') {
      sdk?.terminate();
    }
  }, [sdk, status]);

  const personalSign = async (chainCode: string) => {
    if (!provider || !sdk) {
      Toast.show({
        type: 'error',
        text1: 'Metamask provider is not ready!',
        position: 'bottom',
        bottomOffset: 0,
      });
      return null;
    }

    try {
      console.log("MetaMaskContext: personal sign started");
      setIsLinking(true);

      const channelId = await notifee.createChannel({
        id: 'sticky',
        name: 'Sticky Notifications',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        id: 'wallet',
        title: 'Connecting wallet...',
        body: 'Wallet connection in progress, click to move back to the app',
        android: {
          channelId,
          progress: { indeterminate: true },
          pressAction: { id: 'default' },
          ongoing: true,
          asForegroundService: true
        }
      });

      console.log("connectAndSign started. chainCode="+chainCode);

      // Don't wrap in another Promise
      const signature = await sdk.connectAndSign({
        msg: chainCode,
      });

      console.log("MetaMaskContext: Direct signature response:", signature);
      return signature;

    } catch (error) {
      console.log("Error in personalSign:", error);
      return null;
    } finally {
      try {
        console.log("noifee closed")
        await notifee.stopForegroundService();
      } catch (e) {
        console.log('Error stopping foreground service:', e);
      }
    }
  };

const contextValue = useMemo(() => ({
  personalSign,
  isLinking,
  cancelSign
}), [personalSign, isLinking, cancelSign]);

return (
  <MetaMaskContext.Provider value={contextValue}>
    {children}
  </MetaMaskContext.Provider>
);
};

export const useMetaMask = () => useContext(MetaMaskContext);
