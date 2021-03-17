import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {View} from 'native-base';
import React from 'react';
import {Animated, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {reduxState} from '../types/interfaces';

interface Props {
  date: string;
  photos: Array<PhotoIdentifier>;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
}

const renderPhotos = (
  photos: Array<PhotoIdentifier>,
  opacity: Animated.AnimatedInterpolation,
  numCol: 2 | 3 | 4,
  loading: boolean,
) => {
  let result = [];

  for (let photo of photos) {
    result.push(
      <Animated.View
        // <Animated.Image
        // source={{uri: photo.node.image.uri}}
        style={{
          height: 200,
          backgroundColor: loading ? 'grey' : 'red',
          margin: 3,
          opacity: opacity,
          width: `${90 / numCol}%`,
        }}
        // width={200}
        // height={200}
      />,
    );
  }

  return result;
};

const PhotosChunk: React.FC<Props> = (props) => {
  const loading = useSelector((state: reduxState) => state.loading);

  return (
    <Animated.View style={{width: '100%'}}>
      <Animated.Text style={{opacity: props.opacity}}>
        {props.date}
      </Animated.Text>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          flexWrap: 'wrap',
          width: '100%',
          flexGrow: 1,
          flexBasis: 1
        }}>
        {renderPhotos(props.photos, props.opacity, props.numCol, loading)}
      </View>
    </Animated.View>
  );
};

export default PhotosChunk;
