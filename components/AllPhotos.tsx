import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated, Dimensions} from 'react-native';
import {reduxState, sortedPhotosObject} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import {useSelector} from 'react-redux';

const SCREEN_WIDTH = Dimensions.get('screen').width;

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
  opacityChanges: opacityChanges,
  paddingChanges: paddingChanges,
) => {
  let result = [];
  console.log(distance);
  for (let condition of Object.keys(photos)) {
    let date = new Date();
    if (condition == 'smallDay') {
      result.push(
        <RenderPhotos
          minWidth={SCREEN_WIDTH / 4}
          maxWidth={SCREEN_WIDTH / 2}
          margin={distance.interpolate({
            inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
            outputRange: paddingChanges.smallDay,
          })}
          date={date}
          opacity={distance.interpolate({
            inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
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
          minWidth={SCREEN_WIDTH / 3}
          maxWidth={SCREEN_WIDTH}
          margin={distance.interpolate({
            inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
            outputRange: paddingChanges.largeDay,
          })}
          date={date}
          opacity={distance.interpolate({
            inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
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
          minWidth={SCREEN_WIDTH / 5}
          maxWidth={SCREEN_WIDTH / 3}
          margin={distance.interpolate({
            inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
            outputRange: paddingChanges.month,
          })}
          date={date}
          opacity={distance.interpolate({
            inputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
            outputRange: opacityChanges.month,
          })}
          rowCount={4}
          photos={photos['month']}
          separator="month"
        />,
      );
    }
  }

  return result;
};

const AllPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);

  const opacityChanges = {
    smallDay: sortCondition === 'smallDay' ? [1, 0] : [0, 1],
    largeDay: sortCondition === 'largeDay' ? [1, 0] : [0, 1],
    month: sortCondition === 'month' ? [1, 0] : [0, 1],
  };

  const paddingChanges = {
    smallDay: sortCondition === 'smallDay' ? [5, 3] : [0, 3],
    largeDay: sortCondition === 'largeDay' ? [5, 3] : [0, 3],
    month: sortCondition === 'month' ? [5, 3] : [0, 3],
  };

  return (
    <ScrollView>
      {createRenderPhotos(
        props.photos,
        props.distance,
        opacityChanges,
        paddingChanges,
      )}
    </ScrollView>
  );
};

export default AllPhotos;
