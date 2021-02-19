import {Text, View} from 'native-base';
import React, {ReactElement, useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {FlatList, Dimensions, Animated, Modal, Image} from 'react-native';
import {sortedPhotos} from '../types/interfaces';
import {TouchableOpacity} from 'react-native-gesture-handler';
import SinglePhoto from './SinglePhoto';
import CustomFlatList from './CustomFlatList';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: sortedPhotos;
  width: number;
  height: number;
  numColumn: number;
  distance: Animated.Value;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const renderPhotos = (photos: sortedPhotos) => {
    let result = [];
    for (let date of Object.keys(photos)) {
      result.push(
        <CustomFlatList
          distance={props.distance}
          width={props.width}
          height={props.height}
          photos={photos[date]}
          title={date}
        />,
      );
    }
    return result;
  };

  return (
    <Animated.View
      style={{
        opacity:
          props.numColumn === 2
            ? props.distance.interpolate({
                inputRange: [-200, 0, 200],
                outputRange: [0, 1, 0],
              })
            : props.distance.interpolate({
                inputRange: [-200, 0, 200],
                outputRange: [1, 0, 1],
              }),
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      }}>
      {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>}
    </Animated.View>
  );
};

export default RenderPhotos;
