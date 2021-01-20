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
import CameraRoll, {PhotoIdentifier} from '@react-native-community/cameraroll';
import FastImage from 'react-native-fast-image';
import {storagePermission} from '../utils/permissions';
import {useNavigation} from '@react-navigation/native';
import {getUserBoxMedia} from '../utils/APICAlls';
import store from '../store/store';
import {sortPhotos} from '../utils/functions';
import {ScrollView} from 'react-native-gesture-handler';
import RenderSortedPhotos from './RenderSortedPhotos';

const renderPhotos = (sortedPhotosObject: any) => {
  let result = [];
  for (let photoChunk of Object.keys(sortedPhotosObject)) {
    result.push(
      <RenderSortedPhotos
        title={photoChunk}
        photos={sortedPhotosObject[photoChunk]}
      />,
    );
  }

  return result;
};

const Photos = () => {
  const [storagePhotos, setStoragePhotos] = useState<Array<PhotoIdentifier>>();
  const [boxPhotos, setBoxPhotos] = useState<Array<PhotoIdentifier>>();
  const [allPhotos, setAllPhotos] = useState<Array<PhotoIdentifier>>();
  const [sortedPhotos, setSortedPhotos] = useState<any>();
  const [sortCondition, setSortCondition] = useState<'day' | 'month' | 'week'>(
    'day',
  );
  const [per, setPer] = useState<boolean>(false);

  const navigation = useNavigation();

  useEffect(() => {
    storagePermission()
      .then((res) => {
        setPer(res);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (boxPhotos && storagePhotos) {
      setAllPhotos(boxPhotos.concat(storagePhotos));
    }
  }, [boxPhotos && storagePhotos]);

  useEffect(() => {
    if (per) {
      navigation.navigate('HomePage');
      CameraRoll.getPhotos({
        first: 100,
        assetType: 'All',
      })
        .then((res) => {
          setStoragePhotos(res.edges);
        })
        .catch((error) => {
          console.log(error);
        });
      let token = store.getState().user.token;
      let boxMedia = getUserBoxMedia(token);
      setBoxPhotos(boxMedia);
    } else {
      navigation.navigate('PermissionError');
    }
  }, [per]);

  useEffect(() => {
    if (allPhotos && sortCondition) {
      let sorted = sortPhotos(allPhotos, sortCondition);
      setSortedPhotos(sorted);
    }
  }, [allPhotos && sortCondition]);

  return (
    <View>
      <Button
        onPress={() => {
          setSortCondition('month');
        }}
        title="change Condition"
      />
      <ScrollView>
        {sortedPhotos ? renderPhotos(sortedPhotos) : <Text></Text>}
      </ScrollView>
    </View>
  );
};

export default Photos;
