import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BoxScreen } from '../screens/Box.screen';
import { MainTabsParamList } from './navigatonConfig';
import { WalletScreen } from '../screens/Wallet.screen';
import { SettingsScreen } from '../screens/Settings.screen';
import { PoolScreen } from '../screens/Pool.screen';
import { UserScreen } from '../screens/User.screen';
import {
  BoxIcon,
  PoolIcon,
  SettingsIcon,
  UserIcon,
  WalletIcon,
} from '../components/Icons';
import { useTheme } from '@shopify/restyle';
import { FxTheme } from '@functionland/component-library';

export const MainTabsNavigator = () => {
  const theme = useTheme<FxTheme>();

  return (
    <MainTabs.Navigator
      screenOptions={() => ({
        tabBarActiveTintColor: theme.colors.primary,
      })}
    >
      <MainTabs.Screen
        name="Box"
        component={BoxScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color }) => <BoxIcon color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color }) => <WalletIcon color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Pool"
        component={PoolScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color }) => <PoolIcon color={color} />,
        }}
      />
      <MainTabs.Screen
        name="User"
        component={UserScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </MainTabs.Navigator>
  );
};

const MainTabs = createBottomTabNavigator<MainTabsParamList>();
