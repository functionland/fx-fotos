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
import {storagePermission} from '../utils/permissions';
import {useNavigation} from '@react-navigation/native';

const StogagePhotos = () => {
  const [photos, setPhotos] = useState<any>();
  const [per, setPer] = useState<boolean>(false);

  const navigation = useNavigation();

  useEffect(() => {
    storagePermission()
      .then((res) => {
        setPer(res);
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (per) {
      navigation.navigate("HomePage")
      CameraRoll.getPhotos({
        first: 5,
        assetType: 'Photos',
      })
        .then((res) => {
          setPhotos(res.edges);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      navigation.navigate('PermissionError');
      console.log('permission error');
    }
  }, [per]);

  useEffect(() => {
    console.log(photos);
  }, [photos]);

  return (
    <View>
      {photos ? (
        <FlatList
          key="photos-flatList"
          data={photos}
          numColumns={3}
          renderItem={({item}) => (
            <FastImage
              key={item.node.image.timestamp}
              style={{
                width: '30.5%',
                height: 150,
                margin: 5,
              }}
              source={{uri: item.node.image.uri}}
            />
          )}
        />
      ) : (
        <Text>''</Text>
      )}
    </View>
  );
};

export default StogagePhotos;
