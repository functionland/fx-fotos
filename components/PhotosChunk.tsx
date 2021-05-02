import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import {Animated, Text} from 'react-native';
import {event} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {reduxState} from '../types/interfaces';

interface Props {
  date: string;
  photos: Array<MediaLibrary.Asset>;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  setWrapperHeight: Function;
}

const renderPhotos = (
  photos: Array<MediaLibrary.Asset>,
  opacity: Animated.AnimatedInterpolation,
  numCol: 2 | 3 | 4,
  loading: boolean,
) => {
  let result = [];

  for (let photo of photos) {
    result.push(
      <Animated.View
        //<Animated.Image
        //source={{uri: photo.node.image.uri}}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: 200,
          backgroundColor: loading ? 'grey' : 'red',
          margin: 3,
          opacity: opacity,
          width: `${90 / numCol}%`,
        }}
        key={photo.uri}
        ///>,
      >
        <Text>{photo.uri}</Text>
      </Animated.View>,
    );
  }

  return result;
};

const PhotosChunk: React.FC<Props> = (props) => {
  const loading = useSelector((state: reduxState) => state.loading);

  return (
    <Animated.View
      style={{width: '100%'}}
      onLayout={(event_r) => {
        let {height} = event_r.nativeEvent.layout;
        props.setWrapperHeight(height);
      }}>
      <Animated.Text style={{opacity: props.opacity}}>
        {props.date}
      </Animated.Text>
      <Animated.View
        style={{
          flexDirection: 'row',
          flex: 1,
          flexWrap: 'wrap',
          width: '100%',
          flexGrow: 1,
        }}>
        {renderPhotos(props.photos, props.opacity, props.numCol, loading)}
      </Animated.View>
    </Animated.View>
  );
};

export default PhotosChunk;
