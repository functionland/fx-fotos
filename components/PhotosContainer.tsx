import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {getUserBoxMedia} from '../utils/APICAlls';
import {getStoragePhotos, sortPhotos} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {sortCondition} from '../types/interfaces';

const PhotosContainer = () => {
  const [per, setPer] = useState<boolean>();
  const [photos, setPhotos] = useState<Array<PhotoIdentifier>>();
  const [storagePhotos, setStoragePhotos] = useState<Array<PhotoIdentifier>>();
  const navigation = useNavigation();
  let distance = useRef(new Animated.Value(0)).current;
  const [pinchOrZoom, setPinchOrZoom] = useState<
    'pinch' | 'zoom' | undefined
  >();
  const [sortCondition, setSortCondition] = useState<sortCondition>('day');
  const [numColumns, setNumColumns] = useState<2 | 3 | 4>(2);

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
      let photos_i = boxPhotos.concat(storagePhotos);
      setPhotos(photos_i);
    }
  }, [storagePhotos]);

  return photos ? (
    <PinchZoom
      setPinchOrZoom={setPinchOrZoom}
      distance={distance}
      setSortCondition={setSortCondition}
      setNumColumns={setNumColumns}
      sortCondition={sortCondition}
      numColumns={numColumns}>
      <AllPhotos
        pinchOrZoom={pinchOrZoom}
        distance={distance}
        photos={photos}
        sortCondition={sortCondition}
        numColumns={numColumns}
      />
    </PinchZoom>
  ) : (
    <></>
  );
};

export default PhotosContainer;
