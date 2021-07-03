import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, useWindowDimensions, Platform, UIManager, LayoutAnimation} from 'react-native';
import {getUserBoxMedia} from '../utils/APICalls';
import {getStorageMedia} from '../utils/functions';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {prepareLayout,} from '../utils/functions';
import {
  useRecoilState,
} from 'recoil';
import {photosState, dataProviderState, storiesState, preparedMediaState, mediasState} from '../states';
import {default as Reanimated,} from 'react-native-reanimated';
interface Props {
  scrollY2: Reanimated.SharedValue<number>;
  scrollY3: Reanimated.SharedValue<number>;
  scrollY4: Reanimated.SharedValue<number>;
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PhotosContainer: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const initialPhotoNumber:number = 50000;
  const storiesHeight:number = 1.618*SCREEN_WIDTH/3;

  const [permission, setPermission] = useState<boolean>();
  const [photos, setPhotos] = useRecoilState(photosState);

  const [storagePhotos, setStoragePhotos] = useState<
    Array<MediaLibrary.Asset>
  >([]);
 
  const [medias, setMedias] = useRecoilState(mediasState);
  const [stories, setStories] = useRecoilState(storiesState);
  const [preparedMedia, setPreparedMedia] = useRecoilState(preparedMediaState);

  
  const navigation = useNavigation();

  const devicePhotos = useRef<Array<MediaLibrary.Asset>>([]);
  const mediaTotalCount = useRef<number>(999999999);
  const mediaHasNextPage = useRef<boolean>(true);
  const mediaEndCursor = useRef<string>('');
  const loading = useRef<boolean>(false);

  

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

  
  const [dataProvider, setDataProvider] = useRecoilState(dataProviderState);
  useEffect(()=>{
    if(photos?.length){
      let prepared = prepareLayout(photos,['day', 'month'], preparedMedia.lastTimestamp, medias.length);
      ////console.log('preparedMedia.layout:',{old:preparedMedia?.layout.length, added:prepared?.layout.length, header:prepared?.headerIndexes.length});
      setPreparedMedia(oldPreparedMedia =>  ({
        ...oldPreparedMedia,
        'layout':oldPreparedMedia.layout.concat(prepared.layout), 
        'headerIndexes': oldPreparedMedia.headerIndexes.concat(prepared.headerIndexes), 
        'stories': oldPreparedMedia.stories.concat(prepared.stories),
        'lastTimestamp': prepared.lastTimestamp
      }));
      const getStableId = (index:number) => {
        return [...preparedMedia.layout, ...prepared.layout][index].id;
      }
      setDataProvider(dataProvider.cloneWithRows(dataProvider.getAllData().concat(prepared.layout)));

      //setPreparedMedia(prepared);
      
      let onlyMedias:any[] = prepared.layout.filter(item => typeof item.value !== 'string').map((item)=>{return item.value});
      setMedias(oldOnlyMedia=>oldOnlyMedia.concat(onlyMedias));
      setStories(oldStories=>oldStories.concat(prepared.stories));
    }
  },[photos]);
  const removeElements = (elementIndex:string[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDataProvider(dataProvider.cloneWithRows(
      dataProvider.getAllData().map(
        (x, index)=>{
          if(elementIndex.includes(x.id)){
            return {...x, deleted:true, sortCondition: "deleted"}
          }
          return x;
        }
      )
    ));
  }

  return photos ? (
    <View
      style={{
        flex: 1,
        flexDirection:'column',
        width: SCREEN_WIDTH,
        position: 'relative',
        zIndex:10,
      }}
    >
          <PinchZoom
            scale={props.scale}
            numColumnsAnimated={props.numColumnsAnimated}
            focalX={focalX}
            focalY={focalY}
            numberOfPointers={numberOfPointers}
            velocity={velocity}
          >
            <AllPhotos
              removeElements={removeElements}
              scale={props.scale}
              numColumnsAnimated={props.numColumnsAnimated}
              scrollY2={props.scrollY2} 
              scrollY3={props.scrollY3} 
              scrollY4={props.scrollY4}
              loading={loading.current}
              focalX={focalX}
              focalY={focalY}
              numberOfPointers={numberOfPointers}
              velocity={velocity}
              storiesHeight={storiesHeight}
              HEADER_HEIGHT={props.HEADER_HEIGHT}
              FOOTER_HEIGHT={props.FOOTER_HEIGHT}
              headerShown={props.headerShown}
              SCREEN_HEIGHT={SCREEN_HEIGHT}
              SCREEN_WIDTH={SCREEN_WIDTH}
            />
          </PinchZoom>
    </View>
  ) : (
    <></>
  );
};
const isEqual = (prevProps:Props, nextProps:Props) => {
  return (prevProps.HEADER_HEIGHT === nextProps.HEADER_HEIGHT);
}
export default React.memo(PhotosContainer, isEqual);
