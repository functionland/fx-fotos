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

interface Props {
  photos: sortedPhotosObject;
  pinchScale: number;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const [viewOpacity, setViewOpacity] = useState(new Animated.Value(1));
  const [viewScale, setViewScale] = useState(new Animated.Value(1));

  useEffect(() => {
    if (props.pinchScale) {
    }
  }, [props.pinchScale]);

  const renderPhoto = (photoObject: sortedPhotosObject, pinchScale: number) => {
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
      <RenderSortedPhotos
        photoObject={photoObject['day']}
        pinchScale={pinchScale}
      />,
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
      //   <RenderSortedPhotos
      //     photoObject={photoObject['month']}
      //     pinchScale={pinchScale}
      //   />
      // </Animated.ScrollView>,
      // <RenderSortedPhotos
      //   photoObject={photoObject['week']}
      //   pinchScale={pinchScale}
      // />,
    );

    return result;
  };

  return (
    <ScrollView style={styles.container}>
      {props.photos ? (
        <View style={styles.photoContainer}>
          {renderPhoto(props.photos, props.pinchScale)}
        </View>
      ) : (
        <Text></Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  photoContainer: {},
  container: {},
});

export default RenderPhotos;
