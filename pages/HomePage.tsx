import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  FlatList,
  PermissionsAndroid,
  Platform,
  Text,
  Button,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import FastImage from 'react-native-fast-image';

const HomePage = () => {
  const [photos, setPhotos] = useState<any>();

  async function getPermission() {
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
        return;
      }
    }
    CameraRoll.getPhotos({
      first: 50,
      assetType: 'Photos',
    })
      .then((res) => {
        setPhotos(res.edges);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    getPermission();
  }, []);

  return (
    <View>
      <FlatList
        key="photos-flatList"
        data={photos}
        numColumns={3}
        renderItem={({item}) => (
          <FastImage
            key={item.node.image.uri}
            style={{
              width: '33%',
              height: 150,
            }}
            source={{uri: item.node.image.uri}}
            // resizeMode={FastImage.resizeMode.contain}
          />
        )}
      />
    </View>
  );
};

export default HomePage;
