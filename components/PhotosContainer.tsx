import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {sortedPhotosObject} from '../types/interfaces';
import {getUserBoxMedia} from '../utils/APICAlls';
import {getStoragePhotos, sortPhotos} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';

const PhotosContainer = () => {
  const [per, setPer] = useState<boolean>();
  const [photos, setPhotos] = useState<sortedPhotosObject>();
  const [storagePhotos, setStoragePhotos] = useState<Array<PhotoIdentifier>>();
  const navigation = useNavigation();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (per) {
      navigation.navigate('HomePage');
      getStoragePhotos(per, 20)?.then((res: any) => {
        setStoragePhotos(res.edges);
      });
    } else navigation.navigate('PermissionError');
  }, [per]);

  useEffect(() => {
    storagePermission()
      .then((res) => setPer(res))
      .catch((error) => {});
  }, []);

  useEffect(() => {
    let boxPhotos: Array<PhotoIdentifier> = getUserBoxMedia('');
    if (storagePhotos) {
      let photos = boxPhotos.concat(storagePhotos);
      setPhotos(sortPhotos(photos));
    }
  }, [storagePhotos]);

  return photos ? (
    <PinchZoom opacity={opacity}>
      <AllPhotos opacity={opacity} photos={photos} />
    </PinchZoom>
  ) : (
    <></>
  );
};

export default PhotosContainer;
