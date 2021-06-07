import {Button, Text, View} from 'react-native';
import React from 'react';
import {storagePermission} from '../utils/permissions';
import {useNavigation} from '@react-navigation/native';

const PermissionError = () => {
  const navigation = useNavigation();

  const setPermission = () => {
    storagePermission()
      .then(() => {
        navigation.navigate('HomePage');
      })
      .catch(() => {
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
        title="Allow Permission"
        accessibilityLabel="Allow Permission"
      />
    </View>
  );
};

export default PermissionError;
