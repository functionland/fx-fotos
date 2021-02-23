import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated} from 'react-native';
import {sortedPhotosObject} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';

interface Props {
  photos: sortedPhotosObject;
  distance: Animated.Value;
}

interface opacityChanges {
  smallDay: Array<number>;
  largeDay: Array<number>;
  month: Array<number>;
}

interface paddingChanges {
  smallDay: Array<number>;
  largeDay: Array<number>;
  month: Array<number>;
}

const createRenderPhotos = (
  photos: sortedPhotosObject,
  distance: Animated.Value,
  props: Props,
  opacityChanges: opacityChanges,
  paddingChanges: paddingChanges,
) => {
  let result = [];
  for (let condition of Object.keys(photos)) {
    let date = new Date();
    if (condition == 'smallDay') {
      result.push(
        <RenderPhotos
          minWidth={100}
          maxWidth={150}
          padding={props.distance.interpolate({
            inputRange: [-400, 0, 400],
            outputRange: paddingChanges.smallDay,
          })}
          date={date}
          opacity={props.distance.interpolate({
            inputRange: [-400, 0, 400],
            outputRange: opacityChanges.smallDay,
          })}
          rowCount={3}
          photos={photos['smallDay']}
          separator="smallDay"
        />,
      );
    } else if (condition == 'largeDay') {
      result.push(
        <RenderPhotos
          minWidth={150}
          maxWidth={200}
          padding={props.distance.interpolate({
            inputRange: [-400, 0, 400],
            outputRange: paddingChanges.largeDay,
          })}
          date={date}
          opacity={props.distance.interpolate({
            inputRange: [-400, 0, 400],
            outputRange: opacityChanges.largeDay,
          })}
          rowCount={2}
          photos={photos['largeDay']}
          separator="largeDay"
        />,
      );
    } else if (condition == 'month') {
      result.push(
        <RenderPhotos
          minWidth={80}
          maxWidth={150}
          padding={props.distance.interpolate({
            inputRange: [-400, 0, 400],
            outputRange: paddingChanges.month,
          })}
          date={date}
          opacity={props.distance.interpolate({
            inputRange: [-400, 0, 400],
            outputRange: opacityChanges.month,
          })}
          rowCount={2}
          photos={photos['month']}
          separator="month"
        />,
      );
    }
  }

  return result;
};

const opacityChanges = {
  smallDay: [0, 1, 0],
  largeDay: [1, 0, 1],
  month: [0, 1, 0],
};

const paddingChanges = {
  smallDay: [5, 3, 0],
  largeDay: [0, 3, 5],
  month: [0, 3, 5],
};

const AllPhotos: React.FC<Props> = (props) => {
  return (
    <ScrollView>
      {createRenderPhotos(
        props.photos,
        props.distance,
        props,
        opacityChanges,
        paddingChanges,
      )}
    </ScrollView>
  );
};

export default AllPhotos;
