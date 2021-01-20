import {Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Button} from 'native-base';
import {storagePermission} from '../utils/permissions';
import {useNavigation} from '@react-navigation/native';

const PermissionError = () => {
  const navigation = useNavigation();

  const setPermission = () => {
    storagePermission()
      .then((res) => {
        navigation.navigate('HomePage');
      })
      .catch((err) => {
        return;
      });
  };

  return (
    <View>
      <Text>Permission Error</Text>
      <Button
        onPress={() => {
          setPermission();
        }}>
        <Text>Allow Permission</Text>
      </Button>
    </View>
  );
};

export default PermissionError;
