import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SetupCompleteScreen } from '../screens/InitialSetup/SetupComplete.screen';
import { WalletConnectScreen } from '../screens/InitialSetup/WalletConnect.screen';
import { WelcomeScreen } from '../screens/InitialSetup/Welcome.screen';
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
        name="Setup Complete"
        component={SetupCompleteScreen}
      />
    </InitialSetupStack.Navigator>
  );
};

const InitialSetupStack =
  createNativeStackNavigator<InitialSetupStackParamList>();
