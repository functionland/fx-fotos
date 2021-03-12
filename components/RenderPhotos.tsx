import {Image, View} from 'native-base';
import React from 'react';
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

const renderFlatLists = (photos: sortedPhotos, props: Props, imageWidth: Animated.AnimatedInterpolation) => {
  let result = [];

  // let margin = props.margin.addListener(({value}) => {
  //   return value;
  // });

  // console.log('margin', margin);

  for (let date of Object.keys(photos)) {
    result.push(
      <Animated.FlatList
        key={date}
        data={photos[date]}
        style={{width: SCREEN_WIDTH, opacity: props.opacity}}
        contentContainerStyle={{
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
        }}
        ListHeaderComponent={
          <Animated.Text style={{opacity: props.opacity}}>{date}</Animated.Text>
        }
        numColumns={props.numColumns}
        renderItem={({item}) => (
          // <Animated.Image
          //   source={{uri: item.node.image.uri}}
          <Animated.View
            style={{
              maxWidth: props.maxWidth,
              minWidth: props.minWidth,
              height: SCREEN_HEIGHT / (props.numColumns * 2),
              width: imageWidth,
              margin: props.margin,
              backgroundColor: 'red',
            }}></Animated.View>
        )}
      />,
    );
  }

  return result;
};

const RenderPhotos: React.FC<Props> = (props) => {
  let imageWidth = props.margin.interpolate({
    inputRange: [1, 5],
    outputRange: [
      SCREEN_WIDTH / props.numColumns - 8,
      SCREEN_WIDTH / props.numColumns - 40,
    ],
  });

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: 'auto',
        position: 'absolute',
        top: 0,
        bottom: 0,
      }}
      key={props.separator + props.numColumns}>
      {renderFlatLists(props.photos, props, imageWidth)}
    </View>
  );
};

export default RenderPhotos;
