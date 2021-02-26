import {View} from 'native-base';
import React from 'react';
import {
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import {useSelector} from 'react-redux';
import {reduxState, sortedPhotos} from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: sortedPhotos;
  margin: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  rowCount: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  separator: 'day' | 'month';
}

const renderFlatLists = (photos: sortedPhotos, props: Props) => {
  let result = [];

  for (let date of Object.keys(photos)) {
    result.push(
      <FlatList
        key={date}
        data={photos[date]}
        style={{width: SCREEN_WIDTH}}
        ListHeaderComponent={<Animated.Text style={{opacity: props.opacity}}>{date}</Animated.Text>}
        numColumns={props.rowCount}
        renderItem={({item}) => (
          <Animated.Image
            source={{uri: item.node.image.uri}}
            style={{
              maxWidth: props.maxWidth,
              minWidth: props.minWidth,
              margin: props.margin,
              opacity: props.opacity,
              height: SCREEN_HEIGHT / (props.rowCount * 2),
              width: SCREEN_WIDTH / props.rowCount,
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
    <ScrollView style={{flex: 1, position: 'absolute'}} key={props.separator}>
      {renderFlatLists(props.photos, props)}
    </ScrollView>
  );
};

export default RenderPhotos;
