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
import { default as Reanimated, useSharedValue } from 'react-native-reanimated';

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
  const selectedAssets:Reanimated.SharedValue<number[]> = useSharedValue([]);
  // Since animated arrays are not natively supported and updates do not propagate, we need to ad
  // the two below natively supported numbers to detect changes in the array
  // and change them whenever selectedAssets change and useDerivedValue on those to detect changes
  const lastSelectedAssetIndex = useSharedValue(0);
  const lastSelectedAssetAction = useSharedValue(0); //0:unselect, 1:select

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
 
  const showStory = useRef(new Animated.Value(0)).current;
  const scrollIndex2 = useRef(new Animated.Value(0)).current;
  const scrollIndex3 = useRef(new Animated.Value(0)).current;
  const scrollIndex4 = useRef(new Animated.Value(0)).current;

  const modalShown = useSharedValue(0);
  const animatedImagePositionX = useSharedValue(0);
  const animatedImagePositionY = useSharedValue(0);
  const animatedSingleMediaIndex = useSharedValue(-1);
  const singleImageWidth = useSharedValue(SCREEN_WIDTH);
  const singleImageHeight = useSharedValue(SCREEN_HEIGHT);
  const actionBarOpacity = useSharedValue(0);

  const selectedAssetsRef = useRef<number[]>([]);
  const _setSelectedValueRef = (selected:number[]) => {
    selectedAssetsRef.current = selected;
  }

  Reanimated.useAnimatedReaction(() => {
    return (selectedAssets.value.length*7 + lastSelectedAssetIndex.value*3 + lastSelectedAssetAction.value*1);
  }, (result, previous) => {
    if (result !== previous) {
      actionBarOpacity.value = result;
      if(selectedAssets.value.length>0){
        props.headerShown.value = 0;
      }else{
        props.headerShown.value = 1;
      }
      Reanimated.runOnJS(_setSelectedValueRef)(selectedAssets.value);
    }
  }, [lastSelectedAssetIndex,lastSelectedAssetAction, modalShown]);

  
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

  const _goBack = () => {
    console.log('Went back');
    selectedAssets.value = [];
    lastSelectedAssetIndex.value = -1;
    lastSelectedAssetAction.value = 0;
  }

  const _handleDelete = () => {
    console.log('Deleting');
    console.log(selectedAssetsRef.current);
  }

  const _handleShare = () => console.log('Sharing');

  const _handleAddToAlbum = () => console.log('Adding');

  const _handleMore = () => console.log('Shown more');


  
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
        showStory={showStory}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        selectedAssets={selectedAssets}
        lastSelectedAssetIndex={lastSelectedAssetIndex}
        lastSelectedAssetAction={lastSelectedAssetAction}
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
        storiesHeight={props.storiesHeight}
        showStory={showStory}
        scrollY={props.scrollY3}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        selectedAssets={selectedAssets}
        lastSelectedAssetIndex={lastSelectedAssetIndex}
        lastSelectedAssetAction={lastSelectedAssetAction}
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
        storiesHeight={props.storiesHeight}
        showStory={showStory}
        scrollY={props.scrollY4}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        selectedAssets={selectedAssets}
        lastSelectedAssetIndex={lastSelectedAssetIndex}
        lastSelectedAssetAction={lastSelectedAssetAction}
      />
      <SingleMedia 
        modalShown={modalShown}
        headerShown={props.headerShown}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        numColumnsAnimated={props.numColumnsAnimated}
      />
      <StoryHolder 
        duration={1500}
        showStory={showStory}
        headerShown={props.headerShown}
      />
      <ActionBar
        actionBarOpacity={actionBarOpacity}
        backAction={_goBack}
        actions={[
          {
            icon: "share-variant",
            onPress: _handleShare,
            color: "#007AFF",
            name: "share"
          },
          {
            icon: "plus",
            onPress: _handleAddToAlbum,
            color: "#007AFF",
            name: "add"
          },
          {
            icon: "trash-can-outline",
            onPress: _handleDelete,
            color: "#007AFF",
            name: "delete"
          }
        ]}
        moreActions={[]}
      />
    </View>
    ):(
      <View><Text>No Photos</Text></View>
    )
  );
};

export default AllPhotos;
