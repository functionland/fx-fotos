import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  WelcomeScreen,
  WalletConnectScreen,
  ConnectToBoxScreen,
  SetupWifiScreen,
  SetupCompleteScreen,
  CheckConnectionScreen,
} from '../screens/InitialSetup';
import { InitialSetupStackParamList } from './navigatonConfig';

export const InitialSetupNavigator = () => {
  return (
    <InitialSetupStack.Navigator>
      <InitialSetupStack.Screen name="Welcome" component={WelcomeScreen} />
      <InitialSetupStack.Screen
        name="Wallet Connect"
        component={WalletConnectScreen}
      />
      <InitialSetupStack.Screen
        name="Connect To Box"
        component={ConnectToBoxScreen}
      />
      <InitialSetupStack.Screen name="Setup Wifi" component={SetupWifiScreen} />
      <InitialSetupStack.Screen
        name="Check Connection"
        component={CheckConnectionScreen}
      />
      <InitialSetupStack.Screen
        name="Setup Complete"
        component={SetupCompleteScreen}
      />
    </InitialSetupStack.Navigator>
  );
};

const InitialSetupStack =
  createNativeStackNavigator<InitialSetupStackParamList>();
