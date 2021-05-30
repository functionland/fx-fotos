import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import PermissionError from '../pages/PermissionError';
import React, { useRef } from 'react';
import HomePage from '../pages/HomePage';
import {StyleSheet, Animated, View, StatusBar} from 'react-native';

const Stack = createStackNavigator();
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
            headerShown: false,
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="HomePage"
          >
            {props => <HomePage {...props} scrollAnim={scrollAnim} HEADER_HEIGHT={HEADER_HEIGHT} />}
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

const styles = StyleSheet.create({
  View: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: 'white',
    position: 'relative',
  },
});

export default AppNavigation;
