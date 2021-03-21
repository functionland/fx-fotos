import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {Image, Spinner, View} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  Text,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import {photoChunk, reduxState, sortedPhotos} from '../types/interfaces';
import {sortPhotos} from '../utils/functions';
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

  const [wrapperHeightTemp, setWrapperHeightTemp] = useState<number>();

  useEffect(() => {
    let wrapperHeight = 0;
    if (props.wrapperHeight && wrapperHeightTemp) {
      wrapperHeight = props.wrapperHeight + wrapperHeightTemp;
    } else if (props.wrapperHeight) {
      wrapperHeight = props.wrapperHeight;
    } else if (wrapperHeightTemp) {
      wrapperHeight = wrapperHeightTemp;
    }
    props.setWrapperHeight(wrapperHeight);
  }, [wrapperHeightTemp]);

  const renderChunkPhotos = (
    date: string,
    photos: Array<PhotoIdentifier>,
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
        setWrapperHeight={setWrapperHeightTemp}
      />
    );
    // return <Text>SEGE</Text>
  };

  return props.photos ? (
    <FlatList
      // scrollEnabled={true}
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
      // onEndReached={() => props.getMorePhotosFunction()}
      // contentContainerStyle={{flexGrow: 1}}
      // onEndReachedThreshold={0.5}
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
    <Spinner />
  );
};

export default RenderPhotos;
