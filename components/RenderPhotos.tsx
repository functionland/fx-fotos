import {Image, View} from 'native-base';
import React from 'react';
import {
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {reduxState, sortedPhotos} from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: sortedPhotos;
  margin: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  numColumns: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  separator: 'day' | 'month';
}

const renderFlatLists = (photos: sortedPhotos, props: Props) => {
  let result = [];

  for (let date of Object.keys(photos)) {
    result.push(
      <Animated.FlatList
        key={date}
        data={photos[date]}
        style={{width: SCREEN_WIDTH, opacity: props.opacity}}
        ListHeaderComponent={
          <Animated.Text style={{opacity: props.opacity}}>{date}</Animated.Text>
        }
        numColumns={props.numColumns}
        renderItem={({item}) => (
          <Animated.Image
            source={{uri: item.node.image.uri}}
            style={{
              maxWidth: props.maxWidth,
              minWidth: props.minWidth,
              height: SCREEN_HEIGHT / (props.numColumns * 2),
              width: SCREEN_WIDTH / props.numColumns,
              margin: props.margin,
            }}
          />
        )}
      />,
    );
  }

  return result;
};

const RenderPhotos: React.FC<Props> = (props) => {
  return (
    <ScrollView
      style={{flex: 1, position: 'absolute'}}
      key={props.separator + props.numColumns}>
      {renderFlatLists(props.photos, props)}
    </ScrollView>
  );
};

export default RenderPhotos;
