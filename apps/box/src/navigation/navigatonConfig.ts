import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  InitialSetup: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
};

export type MainTabsParamList = {
  Box: undefined;
  Wallet: undefined;
  Settings: undefined;
  User: undefined;
  Pool: undefined;
};

export type InitialSetupStackParamList = {
  Welcome: undefined;
  'Wallet Connect': undefined;
  'Setup Complete': undefined;
};
