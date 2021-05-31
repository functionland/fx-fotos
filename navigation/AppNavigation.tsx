import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import PermissionError from '../pages/PermissionError';
import React, { useRef } from 'react';
import HomePage from '../pages/HomePage';
import {StyleSheet, Animated, View, StatusBar} from 'react-native';
import Header from '../components/Header';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { BarStyleProps } from '../.history/components/Story/utils/interfaceHelper_20210527230613';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const AppNavigation = () => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 30;

  return (
    <View style={styles.View}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: 'white',
            },
            headerShown: true,
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitle: props => <Header scrollAnim={scrollAnim} HEADER_HEIGHT={HEADER_HEIGHT} {...props} />
          }}
        >
          <Stack.Screen
            name="HomePage"
            options={{
              
            }}
          >
            {props => <HomeNavigation {...props} scrollAnim={scrollAnim} HEADER_HEIGHT={HEADER_HEIGHT} />}
          </Stack.Screen>
          <Stack.Screen
            name="PermissionError"
            component={PermissionError}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

interface Props {
  scrollAnim: Animated.Value;
  HEADER_HEIGHT: number;
}
const HomeNavigation: React.FC<Props> = (mainProps) => {
  return (
    <View style={[styles.View,{marginTop:0}]}>
        <Tab.Navigator
          screenOptions={{
            tabBarColor: 'white',
          }}
          activeColor='#0a72ac'
          inactiveColor="#3e2465"
          barStyle={{ 
            backgroundColor: 'white',
            shadowOpacity: 1, 
            shadowColor: 'black', 
            shadowRadius: 30,
            shadowOffset: {
              width: 3,
              height: 3
            },
          }}
        >
          <Tab.Screen
            name="Photos"
            options={{
              tabBarLabel: 'Photos',
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="photo-video" color={color} size={24} />
              ),
            }}
          >
            {props => <HomePage {...props} scrollAnim={mainProps.scrollAnim} HEADER_HEIGHT={mainProps.HEADER_HEIGHT} />}
          </Tab.Screen>
          <Tab.Screen
            name="Search"
            component={Search}
            options={{
              tabBarLabel: 'Search',
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="search" size={24} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Library"
            component={Library}
            options={{
              tabBarLabel: 'Library',
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="list-alt" size={24} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
    </View>
  );
};

function Search() {
  return (<></>);
}

function Library() {
  return (<></>);
}

const styles = StyleSheet.create({
  View: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: 'white',
    position: 'relative',
  },
});
export default AppNavigation;
