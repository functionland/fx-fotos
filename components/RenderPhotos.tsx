import React from 'react';
import {Animated, Dimensions} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {sortedPhotos} from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: sortedPhotos;
  padding: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  rowCount: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  separator: 'largeDay' | 'smallDay' | 'month';
}

const renderFlatLists = (photos: sortedPhotos, props: Props) => {
  let result = [];

  for (let date of Object.keys(photos)) {
    result.push(
      <FlatList
        key={date}
        data={photos[date]}
        style={{width: SCREEN_WIDTH}}
        numColumns={props.rowCount}
        renderItem={({item}) => (
          <Animated.Image
            source={{uri: item.node.image.uri}}
            style={{
              maxWidth: props.maxWidth,
              minWidth: props.minWidth,
              padding: props.padding,
              opacity: props.opacity,
              height: SCREEN_HEIGHT / (props.rowCount * 2),
              width: SCREEN_WIDTH / props.rowCount
            }}
          />
        )}
      />,
    );
  }

  return result;
};

const RenderPhotos: React.FC<Props> = (props) => {
  return <ScrollView key={props.separator}>{renderFlatLists(props.photos, props)}</ScrollView>;
};

export default RenderPhotos;
