import * as MediaLibrary from "expo-media-library";
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {getUserBoxMedia} from '../utils/APICAlls';
import {getStorageMedia, sortPhotos} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {sortCondition} from '../types/interfaces';
import {getPhotos} from '../store/actions';

const PhotosContainer = () => {
  const [permission, setPermission] = useState<boolean>();
  const [photos, setPhotos] = useState<Array<MediaLibrary.Asset>>();
  const [storagePhotos, setStoragePhotos] = useState<Array<MediaLibrary.Asset>>();
  const navigation = useNavigation();
  let distance = useRef(new Animated.Value(0)).current;
  const [pinchOrZoom, setPinchOrZoom] = useState<
    'pinch' | 'zoom' | undefined
  >();
  const [sortCondition_i, setSortCondition_i] = useState<sortCondition>('day');
  const [numColumns, setNumColumns] = useState<2 | 3 | 4>(2);

  //TODO: Change this function to the getPhotos in actions like in AllPhotos
  useEffect(() => {
    if (permission) {
      navigation.navigate('HomePage');
      getStorageMedia(permission, 20, '0')?.then((res: any) => {
        setStoragePhotos(res.assets);
      });
    } else {
      navigation.navigate('PermissionError');
    }
  }, [permission]);

  useEffect(() => {
    storagePermission()
      .then((res) => setPermission(res))
      .catch((error) => {});
  }, []);

  useEffect(() => {
    let boxPhotos: Array<MediaLibrary.Asset> = getUserBoxMedia('');
    if (storagePhotos) {
      let photos_i = boxPhotos.concat(storagePhotos);
      setPhotos(photos_i);
    }
  }, [storagePhotos]);

  return photos ? (
    <PinchZoom
      setPinchOrZoom={setPinchOrZoom}
      distance={distance}
      setSortCondition={setSortCondition_i}
      setNumColumns={setNumColumns}
      sortCondition={sortCondition_i}
      numColumns={numColumns}>
      <AllPhotos
        pinchOrZoom={pinchOrZoom}
        distance={distance}
        photos={photos}
        sortCondition={sortCondition_i}
        numColumns={numColumns}
      />
    </PinchZoom>
  ) : (
    <></>
  );
};

export default PhotosContainer;
