import * as MediaLibrary from "expo-media-library";
import React from 'react';
import {FlatList, Animated, Dimensions, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {photoChunk, reduxState} from '../types/interfaces';
import PhotosChunk from './PhotosChunk';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: Array<photoChunk>;
  margin: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  numColumns: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  loading: boolean;
  separator: 'day' | 'month';
  getMorePhotosFunction: Function;
  setWrapperHeight: Function;
  wrapperHeight: number | undefined;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const numColumns = useSelector((state: reduxState) => state.numColumns);

  const renderChunkPhotos = (
    date: string,
    photos: Array<MediaLibrary.Asset>,
    opacity: Animated.AnimatedInterpolation,
    numCol: 2 | 3 | 4,
    setWrapperHeight: Function,
  ) => {
    return (
      <PhotosChunk
        date={date}
        photos={photos}
        opacity={opacity}
        numCol={numCol}
        setWrapperHeight={setWrapperHeight}
      />
    );
  };

  console.log('numColumns', numColumns);

  return props.photos ? (
    <FlatList
      scrollEnabled={true}
      data={props.photos}
      renderItem={({item}) =>
        renderChunkPhotos(
          item.date,
          item.data,
          props.opacity,
          props.numColumns,
          props.setWrapperHeight,
        )
      }
      onEndReached={() => console.log('getting photo')}
      // contentContainerStyle={{flexGrow: 1}}
      onEndReachedThreshold={0.9}
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        height: props.wrapperHeight,
        position: 'absolute',
        top: 0,
        bottom: 0,
      }}
      numColumns={props.numColumns}
      key={props.separator + props.numColumns}
    />
  ) : (
    <Text>Loading...</Text>
  );
};

export default RenderPhotos;
