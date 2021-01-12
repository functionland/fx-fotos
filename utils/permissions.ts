import {PermissionsAndroid, Platform} from 'react-native';

export async function storagePermission() {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Permission Explanation',
        message: 'ReactNativeForYou would like to access your photos!',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (result !== 'granted') {
      console.log('Access to pictures was denied');
      return false;
    } else {
      console.log('Access to pictures was granted');
      return true;
    }
  }

  return false;
}
