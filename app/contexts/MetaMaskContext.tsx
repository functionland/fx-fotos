import React, { createContext, useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useSDK } from '@metamask/sdk-react';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Toast from 'react-native-toast-message'
import { useWalletConnectModal } from '@walletconnect/modal-react-native';

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
  const { open, isConnected, provider } = useWalletConnectModal();
  const [isLinking, setIsLinking] = useState(false);

  const cancelSign = useCallback(() => {
    setIsLinking(false);
    try {
      console.log("cancelSign notifee closed");
      notifee.stopForegroundService();
    } catch (e) {
      console.log('Error stopping foreground service:', e);
    }
    provider?.cleanupPendingPairings()

    if (isConnected) {
      provider?.disconnect();
    }
  }, [provider, isConnected]);

  const personalSign = useCallback(async (chainCode: string) => {
    try {
      console.log("personal sign started");
      setIsLinking(true);

      // Create notification channel
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

      // First connect if not connected
      if (!isConnected) {
        console.log('wallet opening')
        await open();
        return
      } else if (isConnected) {
        console.log('getting accounts')
        // Get accounts
        const accounts = await provider?.request({
          method: 'eth_requestAccounts'
        }) as string[];  // Add type assertion

        if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
          throw new Error('No accounts connected');
        }
        console.log("Connected accounts:", accounts);

        // Sign message
        console.log("calling sing with chainCode="+chainCode)
        const signature = await provider?.request({
          method: 'personal_sign',
          params: [chainCode, accounts[0]]
        });

        console.log("Signature received:", signature);
        return signature;
      }

    } catch (error) {
      console.log("Error in personalSign:", error);
      return null;
    } finally {
      setIsLinking(false);
      try {
        await notifee.stopForegroundService();
      } catch (e) {
        console.log('Error stopping foreground service:', e);
      }
    }
  }, [provider, isConnected, open]); // Add dependencies

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
