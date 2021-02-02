import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import CameraRoll, {PhotoIdentifier} from '@react-native-community/cameraroll';
import {storagePermission} from '../utils/permissions';
import {useNavigation} from '@react-navigation/native';
import {getUserBoxMedia} from '../utils/APICAlls';
import store from '../store/store';
import {sortPhotos} from '../utils/functions';
import RenderPhotos from './RenderPhotos';
import PinchAndZoom from './PinchAndZoom';
import {ScrollView} from 'react-native-gesture-handler';
import {sortCondition} from '../types/interfaces';
import RenderSortedPhotos from './RenderSortedPhotos';
import Animated from 'react-native-reanimated';
import PhotosContainer from './PhotosContainer';

interface sortedPhotos {
  day: {[key: string]: Array<PhotoIdentifier>};
  week: {[key: string]: Array<PhotoIdentifier>};
  month: {[key: string]: Array<PhotoIdentifier>};
}

const Photos = () => {
  const [storagePhotos, setStoragePhotos] = useState<Array<PhotoIdentifier>>();
  const [boxPhotos, setBoxPhotos] = useState<Array<PhotoIdentifier>>();
  const [allPhotos, setAllPhotos] = useState<Array<PhotoIdentifier>>();
  const [sortedPhotos, setSortedPhotos] = useState<sortedPhotos>();
  const [sortCondition, setSortCondition] = useState<'day' | 'month' | 'week'>(
    'day',
  );
  const [per, setPer] = useState<boolean>(false);
  const [renderPhotos, setRenderPhotos] = useState<any>();

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
        first: 20,
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
    let result: any = {
      day: [],
      month: [],
      week: [],
    };
    let sortConditionArray = ['day', 'month', 'week'];

    let sortedPhotos: sortedPhotos;

    if (allPhotos) {
      sortedPhotos = {...sortPhotos(allPhotos)};
    } else {
      return;
    }

    let animationValue = 1;

    if (allPhotos && sortCondition) {
      for (let photos of sortConditionArray.reverse()) {
        if (photos == sortCondition) {
          result[photos] = (
            <PinchAndZoom
              fromValue={animationValue === 0 ? 0 : 1}
              toValue={animationValue === 0 ? 1 : 0}>
              <RenderSortedPhotos photoObject={sortedPhotos[sortCondition]} />
            </PinchAndZoom>
          );
        } else if (photos == 'day' || photos == 'month' || photos == 'week') {
          result[photos] = (
            <PinchAndZoom
              fromValue={animationValue === 0 ? 1 : 0}
              toValue={animationValue === 0 ? 0 : 1}>
              <RenderSortedPhotos photoObject={sortedPhotos[photos]} />
            </PinchAndZoom>
          );
        }
      }
    }
    console.log(sortCondition);

    setRenderPhotos(Object.values(result));
  }, [allPhotos, sortCondition]);

  return (
    // <PinchAndZoom>
    // <ScrollView>{renderPhotos ? renderPhotos : <Text></Text>}</ScrollView>
    <PhotosContainer />
    // </PinchAndZoom>
  );
};

export default Photos;
