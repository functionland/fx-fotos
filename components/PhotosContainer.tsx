import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {sortedPhotosObject} from '../types/interfaces';
import {getUserBoxMedia} from '../utils/APICAlls';
import {getStoragePhotos, sortPhotos} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import RenderPhotos from './RenderPhotos';

const PhotosContainer = () => {
  const [per, setPer] = useState<boolean>();
  const [photos, setPhotos] = useState<sortedPhotosObject>();
  const [storagePhotos, setStoragePhotos] = useState<Array<PhotoIdentifier>>();
  const navigation = useNavigation();

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
    let allPhotos: sortedPhotosObject;
    let boxPhotos: Array<PhotoIdentifier> = getUserBoxMedia('');
    if (storagePhotos) {
      let photos = boxPhotos.concat(storagePhotos);
      setPhotos(sortPhotos(photos));
    }
  }, [storagePhotos]);

  return photos ? <RenderPhotos photos={photos} /> : <></>;
};

export default PhotosContainer;
