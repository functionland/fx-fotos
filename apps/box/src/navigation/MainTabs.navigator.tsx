import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BoxScreen } from '../screens/Box.screen';
import { MainTabsParamList } from './navigatonConfig';

export const MainTabsNavigator = () => {
  return (
    <MainTabs.Navigator>
      <MainTabs.Screen name="Box" component={BoxScreen} />
    </MainTabs.Navigator>
  );
};

const MainTabs = createBottomTabNavigator<MainTabsParamList>();
