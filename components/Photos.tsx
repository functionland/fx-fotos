import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import CameraRoll, {PhotoIdentifier} from '@react-native-community/cameraroll';
import {storagePermission} from '../utils/permissions';
import {useNavigation} from '@react-navigation/native';
import {getUserBoxMedia} from '../utils/APICAlls';
import store from '../store/store';
import {sortPhotos} from '../utils/functions';
import PinchToZoom from './PinchToZoom';
import RenderPhotos from './RenderPhotos';

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
  const [pinchScale, setPinchScale] = useState<number>(0);

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
    if (allPhotos && sortCondition) {
      let sorted: any = sortPhotos(allPhotos);

      if (sorted != undefined) {
        // console.log(sorted);
        setSortedPhotos({...sorted});
        console.log('sorted', sorted);
      }
    }
  }, [allPhotos && sortCondition]);

  return (
    <PinchToZoom setPinchScale={setPinchScale}>
      {/* // setSortCondition={setSortCondition}> */}
      {sortedPhotos ? (
        <RenderPhotos pinchScale={pinchScale} photos={sortedPhotos} />
      ) : (
        <Text></Text>
      )}
    </PinchToZoom>
  );
};

export default Photos;
