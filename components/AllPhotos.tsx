import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated, Dimensions, View, StatusBar, Text} from 'react-native';
import {sortCondition, FlatSection} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import * as MediaLibrary from 'expo-media-library';
import {prepareLayout} from '../utils/functions';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  photos: Array<MediaLibrary.Asset>;
  scale: Animated.Value;
  baseScale: Animated.AnimatedAddition;
  pinchOrZoom: 'pinch' | 'zoom' | undefined;
  sortCondition: sortCondition;
  numColumns: 2 | 3 | 4;
  loading: boolean;
  focalX: Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  velocity: Animated.Value;
  isPinchAndZoom: boolean;
  setLoadMore: Function;
}

const AllPhotos: React.FC<Props> = (props) => {
  const [scrollOffset, setScrollOffset] = useState<{[key:string]:(2|3|4|number)}>({'in':0,'to':0});
  const [preparedMedia, setPreparedMedia] = useState<FlatSection>({layout:[],headerIndexes:[]});

  useEffect(()=>{
    let prepared = prepareLayout(props.photos,['day', 'month']);
    setPreparedMedia(prepared);
  },[props.photos]);
  
  return (
    preparedMedia.layout.length>0?(
    <View
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        marginTop: StatusBar.currentHeight || 0,
      }}
    >
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        margin={props.baseScale.interpolate({
          inputRange: [0, 1, 3],
          outputRange: [0, 0, 0],
        })}
        maxWidth={SCREEN_WIDTH*2}
        minWidth={SCREEN_WIDTH/2}
        numColumns={2}
        opacity={props.baseScale.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, 1, 0],
        })}
        sizeTransformScale={
          props.baseScale.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [2.2, 1, 0.66667],
          })
        }
        date={new Date()}
        sortCondition="day"
        zIndex={(props.numColumns === 2)?1:0}
        scale={props.scale}
        isPinchAndZoom={props.isPinchAndZoom}
        scrollOffset={scrollOffset}
        setScrollOffset={setScrollOffset}
        setLoadMore={props.setLoadMore}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        margin={props.baseScale.interpolate({
          inputRange: [0, 1, 3],
          outputRange: [0, 0, 0],
        })}
        maxWidth={SCREEN_WIDTH*2}
        minWidth={SCREEN_WIDTH/2}
        numColumns={3}
        opacity={props.baseScale.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0, 1, 0],
        })}
        sizeTransformScale={
          props.baseScale.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [1.5, 1, 0.75],
          })
        }
        date={new Date()}
        sortCondition="day"
        zIndex={(props.numColumns === 3)?1:0}
        scale={props.scale}
        isPinchAndZoom={props.isPinchAndZoom}
        scrollOffset={scrollOffset}
        setScrollOffset={setScrollOffset}
        setLoadMore={props.setLoadMore}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        margin={props.baseScale.interpolate({
          inputRange: [0, 1, 3],
          outputRange: [0, 0, 0],
        })}
        maxWidth={SCREEN_WIDTH*2}
        minWidth={SCREEN_WIDTH/2}
        numColumns={4}
        opacity={props.baseScale.interpolate({
          inputRange: [1, 2, 3],
          outputRange: [0, 1, 0],
        })}
        sizeTransformScale={
          props.baseScale.interpolate({
            inputRange: [1, 2, 3],
            outputRange: [1.3333, 1, 0.8],
          })
        }
        date={new Date()}
        sortCondition="month"
        zIndex={(props.numColumns === 4)?1:0}
        scale={props.scale}
        isPinchAndZoom={props.isPinchAndZoom}
        scrollOffset={scrollOffset}
        setScrollOffset={setScrollOffset}
        setLoadMore={props.setLoadMore}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
      />
    </View>
    ):(
      <View><Text>No Photos</Text></View>
    )
  );
};

export default AllPhotos;
