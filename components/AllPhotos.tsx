import React, {useEffect, useState, useRef, MutableRefObject} from 'react';
import {Animated, View, useWindowDimensions, Text} from 'react-native';
import {FlatSection, story, layout} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import SingleMedia from './SingleMedia';
import StoryHolder from './StoryHolder';
import ActionBar from './ActionBar';
import { ImageEditor } from './ImageEditor/ImageEditor'

import {
  useRecoilState,
} from 'recoil';
import {preparedMediaState,} from '../states';
import { default as Reanimated, useSharedValue } from 'react-native-reanimated';

interface Props {
  removeElements: Function;
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
  SCREEN_HEIGHT: number;
  SCREEN_WIDTH: number;
}

const AllPhotos: React.FC<Props> = (props) => {
  const selectedAssets:Reanimated.SharedValue<string[]> = useSharedValue([]);
  // Since animated arrays are not natively supported and updates do not propagate, we need to ad
  // the two below natively supported numbers to detect changes in the array
  // and change them whenever selectedAssets change and useDerivedValue on those to detect changes
  const lastSelectedAssetId = useSharedValue('');
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


  const dragY = useSharedValue(0);
  const modalShown = useSharedValue(0);
  const animatedImagePositionX = useSharedValue(0);
  const animatedImagePositionY = useSharedValue(0);
  const animatedSingleMediaIndex = useSharedValue(-1);
  const singleImageWidth = useSharedValue(props.SCREEN_WIDTH);
  const singleImageHeight = useSharedValue(props.SCREEN_HEIGHT);
  const actionBarOpacity = useSharedValue(0);

  const selectedAssetsRef = useRef<string[]>([]);
  const _setSelectedValueRef = (selected:string[]) => {
    selectedAssetsRef.current = selected;
  }

  Reanimated.useAnimatedReaction(() => {
    return ([selectedAssets.value.length, lastSelectedAssetId.value, lastSelectedAssetAction.value]);
  }, (result, previous) => {
    if (result !== previous) {
      if(selectedAssets.value.length>0){
        props.headerShown.value = 0;
        actionBarOpacity.value = 1;
      }else{
        props.headerShown.value = 1;
        actionBarOpacity.value = 0;
      }
      Reanimated.runOnJS(_setSelectedValueRef)(selectedAssets.value);
    }
  }, [lastSelectedAssetId,lastSelectedAssetAction, modalShown]);


  const _goBack = () => {
    console.log('Went back');
    selectedAssets.value = [];
    lastSelectedAssetId.value = '';
    lastSelectedAssetAction.value = 0;
  }

  const _handleDelete = () => {
    console.log('Deleting');
    console.log(selectedAssetsRef.current);
    props.removeElements(selectedAssetsRef.current);
    _goBack();
  }

  const _handleShare = () => console.log('Sharing');

  const _handleAddToAlbum = () => console.log('Adding');

  const _handleMore = () => console.log('Shown more');


  
  return (
    preparedMedia.layout.length>0?(
    <View
      style={{
        flex: 1,
        width: props.SCREEN_WIDTH,
        position: 'relative',
      }}
    >
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={props.SCREEN_WIDTH*2}
        minWidth={props.SCREEN_WIDTH/2}
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
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
        dragY={dragY}
        SCREEN_HEIGHT={props.SCREEN_HEIGHT}
        SCREEN_WIDTH={props.SCREEN_WIDTH}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={props.SCREEN_WIDTH*2}
        minWidth={props.SCREEN_WIDTH/2}
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
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
        dragY={dragY}
        SCREEN_HEIGHT={props.SCREEN_HEIGHT}
        SCREEN_WIDTH={props.SCREEN_WIDTH}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={props.SCREEN_WIDTH*2}
        minWidth={props.SCREEN_WIDTH/2}
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
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
        dragY={dragY}
        SCREEN_HEIGHT={props.SCREEN_HEIGHT}
        SCREEN_WIDTH={props.SCREEN_WIDTH}
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
        selectedAssets={selectedAssets}
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
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
const isEqual = (prevProps:Props, nextProps:Props) => {
  return (prevProps.storiesHeight === nextProps.storiesHeight && prevProps.removeElements === nextProps.removeElements);
}
export default React.memo(AllPhotos, isEqual);
