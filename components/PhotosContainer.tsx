import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {getUserBoxMedia} from '../utils/APICAlls';
import {getStoragePhotos, sortPhotos} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';

const PhotosContainer = () => {
  const [per, setPer] = useState<boolean>();
  const [photos, setPhotos] = useState<Array<PhotoIdentifier>>();
  const [storagePhotos, setStoragePhotos] = useState<Array<PhotoIdentifier>>();
  const navigation = useNavigation();
  let distance = useRef(new Animated.Value(0)).current;
  const [pinchOrZoom, setPinchOrZoom] = useState<"pinch" | "zoom" | undefined>()

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
      setPhotos(photos);
    }
  }, [storagePhotos]);

  return photos ? (
    <PinchZoom setPinchOrZoom={setPinchOrZoom} distance={distance}>
      <AllPhotos pinchOrZoom={pinchOrZoom} distance={distance} photos={photos} />
    </PinchZoom>
  ) : (
    <></>
  );
};

export default PhotosContainer;
