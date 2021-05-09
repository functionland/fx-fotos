import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {getUserBoxMedia} from '../utils/APICalls';
import {getStorageMedia} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {sortCondition, MediaItem} from '../types/interfaces';

const PhotosContainer = () => {
  const initialPhotoNumber:number = 50;
  const [permission, setPermission] = useState<boolean>();
  const [photos, setPhotos] = useState<Array<MediaLibrary.Asset>>();
  const [mediaEndCursor, setMediaEndCursor] = useState<string>();
  const [mediaHasNextPage, setMediaHasNextPage] = useState<boolean>(true);
  const [mediaTotalCount , setMediaTotalCount] = useState<number>(99999);
  const [storagePhotos, setStoragePhotos] = useState<
    Array<MediaLibrary.Asset>
  >();
  const navigation = useNavigation();

  let scale = useRef(new Animated.Value(1)).current;
  let baseScale2 = useRef(new Animated.Value(0)).current;
  const baseScale: Animated.AnimatedAddition = useRef(Animated.add(baseScale2, scale.interpolate({
    inputRange: [0, 1, 4],
    outputRange: [1, 0, -1],
  }))).current;

  const scrollIndicator = useRef(new Animated.Value(0)).current;
  const focalX = useRef(new Animated.Value(0)).current;
  const focalY = useRef(new Animated.Value(0)).current;
  const numberOfPointers = useRef(new Animated.Value(0)).current;
  const velocity = useRef(new Animated.Value(0)).current;

  const [pinchOrZoom, setPinchOrZoom] = useState<
    'pinch' | 'zoom' | undefined
  >();
  const [sortCondition_i, setSortCondition_i] = useState<sortCondition>('day');
  const [numColumns, setNumColumns] = useState<2 | 3 | 4>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPinchAndZoom, setIsPinchAndZoom] = useState<boolean>(false);

  //TODO: Change this function to the getPhotos in actions like in AllPhotos
  useEffect(() => {
    if (permission) {
      navigation.navigate('HomePage');
      setLoading(true);
      getStorageMedia(permission, initialPhotoNumber)?.then(
        (res: MediaItem) => {
          setStoragePhotos(res.assets);
          setMediaEndCursor(res.endCursor);
          setMediaHasNextPage(res.hasNextPage);
          setMediaTotalCount(res.totalCount);
          setLoading(false);
        },
      ).catch(error => console.log(error));
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
      pinchOrZoom={pinchOrZoom}
      scale={scale}
      baseScale={baseScale}
      baseScale2={baseScale2}
      setSortCondition={setSortCondition_i}
      setNumColumns={setNumColumns}
      sortCondition={sortCondition_i}
      numColumns={numColumns}
      focalX={focalX}
      focalY={focalY}
      numberOfPointers={numberOfPointers}
      velocity={velocity}
      setIsPinchAndZoom={setIsPinchAndZoom}
      isPinchAndZoom={isPinchAndZoom}
    >
      <AllPhotos
        pinchOrZoom={pinchOrZoom}
        scale={scale}
        baseScale={baseScale}
        photos={photos}
        sortCondition={sortCondition_i}
        numColumns={numColumns}
        loading={loading}
        focalX={focalX}
        focalY={focalY}
        numberOfPointers={numberOfPointers}
        velocity={velocity}
        isPinchAndZoom={isPinchAndZoom}
      />
    </PinchZoom>
  ) : (
    <></>
  );
};

export default PhotosContainer;
