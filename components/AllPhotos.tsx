import React, {useEffect, useState, useRef, MutableRefObject} from 'react';
import {Animated, Dimensions, View, Systrace, Text} from 'react-native';
import {FlatSection, story, layout} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import SingleMedia from './SingleMedia';
import StoryHolder from './StoryHolder';
import ActionBar from './ActionBar';

import { Asset } from 'expo-media-library';
import {prepareLayout,} from '../utils/functions';
import {
  useRecoilState,
} from 'recoil';
import {preparedMediaState,} from '../states';
import {default as Reanimated,} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
  scrollY2: Reanimated.SharedValue<number>
  scrollY3: Reanimated.SharedValue<number>
  scrollY4: Reanimated.SharedValue<number>
  loading: boolean;
  focalX: Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  velocity: Animated.Value;
  storiesHeight: number;
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
}

const AllPhotos: React.FC<Props> = (props) => {
  const [preparedMedia, setPreparedMedia] = useRecoilState(preparedMediaState);

  useEffect(()=>{
    console.log([Date.now()+': component AllPhotos rendered']);
  });

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    console.log(['component AllPhotos mounted']);
    return () => {isMounted.current = false;console.log(['component AllPhotos unmounted']);}
  }, []);
 
  const modalShown = useRef(new Animated.Value(0)).current;
  const showStory = useRef(new Animated.Value(0)).current;
  const scrollIndex2 = useRef(new Animated.Value(0)).current;
  const scrollIndex3 = useRef(new Animated.Value(0)).current;
  const scrollIndex4 = useRef(new Animated.Value(0)).current;

  const [imagePosition, setImagePosition] = useState<{x:number;y:number}>({x:0,y:0});

  const [showActionBar, setShowActionBar] = useState<boolean>(false);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  
  const selectMedia = (media:Asset, selected:boolean) => {
    let layout:layout[] = preparedMedia.layout;
    let index = layout.findIndex(x=>(typeof x.value!=='string' && x.value.id===media.id));
    layout[index] = {
      ...layout[index],
      selected: selected,
    }
    setPreparedMedia(oldPreparedMedia =>  ({
      ...oldPreparedMedia,
      'layout':layout
    }));
  }

  useEffect(()=>{
    if(selectedAssets.length && !showActionBar){
      setShowActionBar(true);
    }else if(showActionBar && selectedAssets.length===0){
      setShowActionBar(false);
    }
  },[selectedAssets]);

  const onMediaLongTap = (selectedAsset:Asset|undefined) => {
    if(selectedAsset===undefined){
      for(let i=0;i<selectedAssets.length;i++){
        selectMedia(selectedAssets[i], false);
      }
      setSelectedAssets([]);
    }else{
      let isAlreadySelected:number = selectedAssets.findIndex(x=>x.id === selectedAsset.id);
      if(isAlreadySelected===-1){
        setSelectedAssets(oldSelected=>[...oldSelected,selectedAsset]);
        selectMedia(selectedAsset, true);
      }else{
        setSelectedAssets(oldSelected=>oldSelected.filter(x=>x.id !== selectedAsset.id));
        selectMedia(selectedAsset, false);
      }
    }
  }
  
  return (
    preparedMedia.layout.length>0?(
    <View
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        position: 'relative',
      }}
    >
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={SCREEN_WIDTH*2}
        minWidth={SCREEN_WIDTH/2}
        numColumns={2}
        sortCondition="day"
        scale={props.scale}
        numColumnsAnimated={props.numColumnsAnimated}
        scrollIndex2={scrollIndex2}
        scrollIndex3={scrollIndex3}
        scrollIndex4={scrollIndex4}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
        modalShown={modalShown}
        headerShown={props.headerShown}
        storiesHeight={props.storiesHeight}
        scrollY={props.scrollY2}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        onMediaLongTap={onMediaLongTap}
        showStory={showStory}
        setImagePosition={setImagePosition}

        showSelectionCheckbox={showActionBar}
        selectedAssets={selectedAssets}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={SCREEN_WIDTH*2}
        minWidth={SCREEN_WIDTH/2}
        numColumns={3}
        sortCondition="day"
        numColumnsAnimated={props.numColumnsAnimated}
        scale={props.scale}
        scrollIndex2={scrollIndex2}
        scrollIndex3={scrollIndex3}
        scrollIndex4={scrollIndex4}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
        modalShown={modalShown}
        headerShown={props.headerShown}
        setImagePosition={setImagePosition}
        storiesHeight={props.storiesHeight}
        showStory={showStory}
        scrollY={props.scrollY3}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        onMediaLongTap={onMediaLongTap}
        showSelectionCheckbox={showActionBar}
        selectedAssets={selectedAssets}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={SCREEN_WIDTH*2}
        minWidth={SCREEN_WIDTH/2}
        numColumns={4}
        sortCondition="month"
        numColumnsAnimated={props.numColumnsAnimated}
        scale={props.scale}
        scrollIndex2={scrollIndex2}
        scrollIndex3={scrollIndex3}
        scrollIndex4={scrollIndex4}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
        modalShown={modalShown}
        headerShown={props.headerShown}
        setImagePosition={setImagePosition}
        storiesHeight={props.storiesHeight}
        showStory={showStory}
        scrollY={props.scrollY4}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        onMediaLongTap={onMediaLongTap}
        showSelectionCheckbox={showActionBar}
        selectedAssets={selectedAssets}
      />
      <SingleMedia 
        modalShown={modalShown}
        headerShown={props.headerShown}
        imagePosition={imagePosition}
      />
      <StoryHolder 
        duration={1500}
        showStory={showStory}
        headerShown={props.headerShown}
      />
      <ActionBar
        setShowActionBar={setShowActionBar}
        showActionBar={showActionBar}
      />
    </View>
    ):(
      <View><Text>No Photos</Text></View>
    )
  );
};

export default React.memo(AllPhotos);
