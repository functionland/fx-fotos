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
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  ScrollView,
} from 'react-native-gesture-handler';
import RenderSortedPhotos from './RenderSortedPhotos';
import Animated from 'react-native-reanimated';

const pinchAndZoomHandler = (
  event: PinchGestureHandlerGestureEvent,
  condition: 'day' | 'month' | 'week',
) => {
  let zoomOrPinch: 'zoom' | 'pinch';
  let result: 'day' | 'month' | 'week' = 'day';
  if (event.nativeEvent.scale > 1) {
    zoomOrPinch = 'zoom';
  } else {
    zoomOrPinch = 'pinch';
  }

  if (condition == 'day') {
    zoomOrPinch == 'zoom' ? (result = 'day') : (result = 'week');
  } else if (condition == 'week') {
    zoomOrPinch == 'zoom' ? (result = 'day') : (result = 'month');
  } else if (condition == 'month') {
    zoomOrPinch == 'zoom' ? (result = 'week') : (result = 'month');
  }

  return result;
};

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
    <PinchGestureHandler
      onGestureEvent={(event) =>
        setSortCondition(pinchAndZoomHandler(event, sortCondition))
      }
      onHandlerStateChange={() => console.log('soote')}>
      {/* <Animated.View> */}
      <ScrollView>
        {sortedPhotos ? renderPhotos(sortedPhotos) : <Text></Text>}
      </ScrollView>
      {/* </Animated.View> */}
    </PinchGestureHandler>
  );
};

export default Photos;
