import React from 'react';
import {Text, View} from 'react-native';
import {Provider} from 'react-redux';
//import AppNavigation from './navigation/AppNavigation';
import store from './store/store';

const App = () => {
  return (
    <Provider store={store}>
      <View>
        <Text>test</Text>
      </View>
    </Provider>
  );
};

export default App;
