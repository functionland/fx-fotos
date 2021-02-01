import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useRef, useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Animated} from 'react-native';
import {
  sortCondition,
  sortedPhotos,
  sortedPhotosObject,
} from '../types/interfaces';
import RenderSortedPhotos from './RenderSortedPhotos';
import PinchAndZoom from './PinchAndZoom';

interface Props {
  photos: sortedPhotosObject;
  sortCondition: sortCondition;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const [viewOpacity, setViewOpacity] = useState(new Animated.Value(1));
  const [viewScale, setViewScale] = useState(new Animated.Value(1));

  const renderPhoto = (photoObject: sortedPhotosObject) => {
    let result = [];

    result.push(
      // <Animated.ScrollView
      //   style={{
      //     opacity: viewOpacity,
      //     width: viewScale.interpolate({
      //       inputRange: [1, 2],
      //       outputRange: [1, 5],
      //     }),
      //   }}>
      <RenderSortedPhotos photoObject={photoObject['day']} />,
      // </Animated.ScrollView>,
      // <Animated.ScrollView
      //   style={{
      //     opacity: viewOpacity.interpolate({
      //       inputRange: [0, 1],
      //       outputRange: [1, 0],
      //     }),
      //     width: viewScale.interpolate({
      //       inputRange: [1, 2],
      //       outputRange: [5, 1],
      //     }),
      //   }}>
      <RenderSortedPhotos photoObject={photoObject['month']} />,
      // </Animated.ScrollView>,
      // <RenderSortedPhotos
      //   photoObject={photoObject['week']}
      //   pinchScale={pinchScale}
      // />,
    );

    result.map;

    return result;
  };

  return <>{props.photos ? renderPhoto(props.photos) : <Text></Text>}</>;
};

const styles = StyleSheet.create({
  photoContainer: {},
  container: {},
});

export default RenderPhotos;
