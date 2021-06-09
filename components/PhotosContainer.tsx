import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, useWindowDimensions, } from 'react-native';
import {getUserBoxMedia} from '../utils/APICalls';
import {getStorageMedia} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {sortCondition, MediaItem, } from '../types/interfaces';

interface Props {
  scrollAnim: Animated.Value;
  HEADER_HEIGHT: number;
  headerShown: Animated.Value;
}

const PhotosContainer: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const initialPhotoNumber:number = 5000;
  const storiesHeight:number = 1.618*SCREEN_WIDTH/3;

  const [permission, setPermission] = useState<boolean>();
  const [photos, setPhotos] = useState<Array<MediaLibrary.Asset>>([]);

  const [storagePhotos, setStoragePhotos] = useState<
    Array<MediaLibrary.Asset>
  >([]);
 
  const [sortCondition_i, setSortCondition_i] = useState<sortCondition>('day');
  const [numColumns, setNumColumns] = useState<2 | 3 | 4>(2);
  const [isPinchAndZoom, setIsPinchAndZoom] = useState<boolean>(false);
  
  const navigation = useNavigation();

  const devicePhotos = useRef<Array<MediaLibrary.Asset>>([]);
  const mediaTotalCount = useRef<number>(999999999);
  const mediaHasNextPage = useRef<boolean>(true);
  const mediaEndCursor = useRef<string>('');
  const loading = useRef<boolean>(false);

  const scale = useRef(new Animated.Value(1)).current;
  const baseScale2 = useRef(new Animated.Value(0)).current;
  const baseScale: Animated.AnimatedAddition = useRef(Animated.add(baseScale2, scale.interpolate({
    inputRange: [0, 1, 4],
    outputRange: [1, 0, -1],
  }))).current;

  const scrollIndicator = useRef(new Animated.Value(0)).current;
  const focalX = useRef(new Animated.Value(0)).current;
  const focalY = useRef(new Animated.Value(0)).current;
  const numberOfPointers = useRef(new Animated.Value(0)).current;
  const velocity = useRef(new Animated.Value(0)).current;

  
  

  //TODO: Change this function to the getPhotos in actions like in AllPhotos
  function getMedia(permission:boolean, photoNumber:number){
    if(mediaHasNextPage.current){
      console.log('media fetch loop');
      loading.current = true;
      getStorageMedia(permission, photoNumber, mediaEndCursor.current)?.then(
        (value) => {
          if(value){
            mediaTotalCount.current = value.totalCount;
            setStoragePhotos(value.assets);
            mediaEndCursor.current = value.endCursor;
            mediaHasNextPage.current = value.hasNextPage;
            getMedia(permission, photoNumber);
          }
          
        },
      ).catch(error => loading.current = false);
    }else{
      loading.current = false;
    }
  }
  useEffect(() => {
    if (permission) {
      navigation.navigate('HomePage');
      getMedia(permission, initialPhotoNumber);
    } else if(!permission) {
      navigation.navigate('PermissionError');
    }
  }, [permission]);

  useEffect(()=>{
    console.log([Date.now()+': component PhotosContainer rendered']);
  });
  useEffect(() => {
    console.log(['component PhotosContainer mounted']);
    storagePermission()
      .then((res) => setPermission(res))
      .catch((error) => {});
      return () => {console.log(['component PhotosContainer unmounted']);}
  }, []);

  useEffect(() => {
    let boxPhotos: Array<MediaLibrary.Asset> = getUserBoxMedia('');
    if (storagePhotos) {
      setPhotos([...boxPhotos, ...storagePhotos]);
    }
  }, [storagePhotos]);

  return photos ? (
    <View
      style={{
        flex: 1,
        flexDirection:'column',
        width: SCREEN_WIDTH,
        position: 'relative',
        zIndex:10
      }}
    >
          <PinchZoom
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
              scale={scale}
              baseScale={baseScale}
              photos={photos}
              sortCondition={sortCondition_i}
              numColumns={numColumns}
              loading={loading.current}
              focalX={focalX}
              focalY={focalY}
              numberOfPointers={numberOfPointers}
              velocity={velocity}
              isPinchAndZoom={isPinchAndZoom}
              setLoadMore={()=>{}}
              storiesHeight={storiesHeight}
              scrollAnim={props.scrollAnim}
              HEADER_HEIGHT={props.HEADER_HEIGHT}
              setHeaderShown={()=>{}}
            />
          </PinchZoom>
    </View>
  ) : (
    <></>
  );
};

export default PhotosContainer;
