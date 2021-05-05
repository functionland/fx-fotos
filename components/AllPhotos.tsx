import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated, Dimensions} from 'react-native';
import {sortCondition} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import * as MediaLibrary from 'expo-media-library';
import {sectionizeMedia} from '../utils/functions';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: Array<MediaLibrary.Asset>;
  scale: Animated.Value;
  baseScale: Animated.AnimatedAddition;
  pinchOrZoom: 'pinch' | 'zoom' | undefined;
  sortCondition: sortCondition;
  numColumns: 2 | 3 | 4;
  loading: boolean;
}

const AllPhotos: React.FC<Props> = (props) => {
  const [wrapperHeight, setWrapperHeight] = useState<number>();
  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{
        width: SCREEN_WIDTH,
        height: wrapperHeight ? wrapperHeight + 200 : SCREEN_HEIGHT,
        // flexWrap: "wrap",
        // alignSelf: "baseline"
        // height: "auto",
        // flexGrow: 1,
      }}>
      <RenderPhotos
        setWrapperHeight={setWrapperHeight}
        wrapperHeight={wrapperHeight}
        photos={sectionizeMedia(props.photos, 'day')}
        loading={props.loading}
        margin={props.baseScale.interpolate({
          inputRange: [0, 1, 3],
          outputRange: [5, 1, 5],
        })}
        maxWidth={SCREEN_WIDTH / 2}
        minWidth={SCREEN_WIDTH / 3}
        numColumns={2}
        opacity={props.baseScale.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, 1, 0],
        })}
        date={new Date()}
        separator="day"
        zIndex={(props.numColumns === 2)?1:0}
      />
      <RenderPhotos
        setWrapperHeight={setWrapperHeight}
        wrapperHeight={wrapperHeight}
        photos={sectionizeMedia(props.photos, 'day')}
        loading={props.loading}
        margin={props.baseScale.interpolate({
          inputRange: [0, 1, 3],
          outputRange: [5, 1, 5],
        })}
        maxWidth={SCREEN_WIDTH / 2}
        minWidth={SCREEN_WIDTH / 4}
        numColumns={3}
        opacity={props.baseScale.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0, 1, 0],
        })}
        date={new Date()}
        separator="day"
        zIndex={(props.numColumns === 3)?1:0}
      />
      <RenderPhotos
        photos={sectionizeMedia(props.photos, 'month')}
        wrapperHeight={wrapperHeight}
        setWrapperHeight={setWrapperHeight}
        loading={props.loading}
        margin={props.baseScale.interpolate({
          inputRange: [0, 1, 3],
          outputRange: [5, 1, 5],
        })}
        maxWidth={SCREEN_WIDTH / 3}
        minWidth={SCREEN_WIDTH / 5}
        numColumns={4}
        opacity={props.baseScale.interpolate({
          inputRange: [1, 2, 3],
          outputRange: [0, 1, 0],
        })}
        date={new Date()}
        separator="month"
        zIndex={(props.numColumns === 4)?1:0}
      />
    </ScrollView>
  );
};

export default AllPhotos;
