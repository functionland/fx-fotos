import {Text, View, Button} from 'react-native';
import React, {useState, useEffect} from 'react';
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
        }}
        title='Allow Permission'
        accessibilityLabel='Allow Permission'
        />
    </View>
  );
};

export default PermissionError;
