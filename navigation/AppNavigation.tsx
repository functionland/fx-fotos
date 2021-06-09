import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PermissionError from '../pages/PermissionError';
import React, { useRef, } from 'react';
import HomePage from '../pages/HomePage';
import {StyleSheet, Animated, View} from 'react-native';
import Header from '../components/Header';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const AppNavigation = () => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const headerShown = useRef(new Animated.Value(1)).current;
  const HEADER_HEIGHT = 30;

  const clampedScrollY = scrollAnim.interpolate({
    inputRange: [HEADER_HEIGHT, HEADER_HEIGHT + 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
    });
    const minusScrollY = Animated.multiply(clampedScrollY, -1);
    const translateY = Animated.diffClamp(minusScrollY, -HEADER_HEIGHT, 0);

  return (
    <Animated.View style={[styles.View, 
    ]}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerCenter: () => <Header scrollAnim={scrollAnim} HEADER_HEIGHT={HEADER_HEIGHT} headerShown={headerShown} />,
            ////headerTitle: '',
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerHideShadow:true,
            headerTranslucent:true,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="HomePage"
            options={{
              
            }}
          >
            {props => <HomeNavigation {...props} scrollAnim={scrollAnim} HEADER_HEIGHT={HEADER_HEIGHT} headerShown={headerShown} />}
          </Stack.Screen>
          <Stack.Screen
            name="PermissionError"
            component={PermissionError}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
};

interface Props {
  scrollAnim: Animated.Value;
  HEADER_HEIGHT: number;
  headerShown: Animated.Value;
}
const HomeNavigation: React.FC<Props> = (mainProps) => {
  return (
    <Animated.View 
      style={
        [
          styles.View,
          {
            marginTop:0, 
          }
        ]
      }>
        <Tab.Navigator
          screenOptions={{
            tabBarColor: 'white',
          }}
          activeColor='#0a72ac'
          inactiveColor="#3e2465"
          //TODO: Find a way to remove the need to ignore ts error
          //@ts-ignore 
          barStyle={{ 
            backgroundColor: 'white',
            shadowOpacity: 1, 
            shadowColor: 'black', 
            shadowRadius: 30,
            shadowOffset: {
              width: 3,
              height: 3
            },
            opacity: mainProps.headerShown,
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
            {props => <HomePage {...props} scrollAnim={mainProps.scrollAnim} HEADER_HEIGHT={mainProps.HEADER_HEIGHT} headerShown={mainProps.headerShown} />}
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
    </Animated.View>
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
    //marginTop: StatusBar.currentHeight || 0,
    backgroundColor: 'white',
    position: 'relative',
  },
});
export default AppNavigation;
