import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated, Dimensions, SafeAreaView, View} from 'react-native';
import {reduxState} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import {useSelector} from 'react-redux';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {sortPhotos} from '../utils/functions';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: Array<PhotoIdentifier>;
  distance: Animated.Value;
}

const defaultOpacityChanges = {
  smallDay: [0, 1],
  largeDay: [0, 1],
  month: [0, 1],
};

const defaultMarginChanges = {
  smallDay: [0, 3],
  largeDay: [0, 3],
  month: [0, 3],
};

const AllPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);

  console.log(sortCondition);

  return (
    <SafeAreaView style={{flex: 1}}>
      <RenderPhotos
        photos={sortPhotos(props.photos, 'day')}
        margin={props.distance.interpolate({
          inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
          outputRange: [0, 3],
        })}
        maxWidth={SCREEN_WIDTH / 2}
        minWidth={SCREEN_WIDTH / 3}
        rowCount={2}
        opacity={props.distance.interpolate({
          inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
          outputRange: sortCondition == 'largeDay' ? [1, 0] : [0, 1],
        })}
        date={new Date()}
        separator="day"
      />
      <RenderPhotos
        photos={sortPhotos(props.photos, 'day')}
        margin={props.distance.interpolate({
          inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
          outputRange: [0, 3],
        })}
        maxWidth={SCREEN_WIDTH / 2}
        minWidth={SCREEN_WIDTH / 4}
        rowCount={3}
        opacity={props.distance.interpolate({
          inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
          outputRange: sortCondition == 'smallDay' ? [1, 0] : [0, 1],
        })}
        date={new Date()}
        separator="day"
      />
      <RenderPhotos
        photos={sortPhotos(props.photos, 'month')}
        margin={props.distance.interpolate({
          inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
          outputRange: [0, 3],
        })}
        maxWidth={SCREEN_WIDTH / 3}
        minWidth={SCREEN_WIDTH / 5}
        rowCount={4}
        opacity={props.distance.interpolate({
          inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
          outputRange: sortCondition == 'month' ? [1, 0] : [0, 1],
        })}
        date={new Date()}
        separator="month"
      />
    </SafeAreaView>
  );
};

export default AllPhotos;
