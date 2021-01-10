/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import HomePage from './pages/HomePage';

declare const global: {HermesInternal: null | {}};

const App = () => {

  return (
    <SafeAreaView>
      <HomePage />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
