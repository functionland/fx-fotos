import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated, Dimensions, View} from 'react-native';
import {reduxState, sortedPhotosObject} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import {useSelector} from 'react-redux';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

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
    }
    if (condition == 'largeDay') {
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
    }
    if (condition == 'month') {
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

const defaultOpacityChanges = {
  smallDay: [0, 1],
  largeDay: [0, 1],
  month: [0, 1],
};

const defaultPaddingChanges = {
  smallDay: [0, 3],
  largeDay: [0, 3],
  month: [0, 3],
};

const AllPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);

  const [opacityChanges, setOpacityChanges] = useState<opacityChanges>(
    defaultOpacityChanges,
  );
  const [paddingChanges, setPaddingChanges] = useState<paddingChanges>(
    defaultPaddingChanges,
  );

  useEffect(() => {
    if (sortCondition) {
      let _opacityChanges = {...opacityChanges};
      for (let condition of Object.keys(opacityChanges)) {
        if (condition == sortCondition) {
          _opacityChanges[condition] = [1, 0];
        } else if (condition == 'smallDay') {
          _opacityChanges[condition] = [0, 1];
        } else if (condition == 'largeDay') {
          _opacityChanges[condition] = [0, 1];
        } else if (condition == 'month') {
          _opacityChanges[condition] = [0, 1];
        }
      }
      console.log(_opacityChanges);
      setOpacityChanges(_opacityChanges);
    }
  }, [sortCondition]);

  useEffect(() => {}, [opacityChanges]);

  return (
    <View style={{flex: 1, minHeight: SCREEN_HEIGHT}}>
        {createRenderPhotos(
          props.photos,
          props.distance,
          opacityChanges,
          paddingChanges,
        )}
    </View>
  );
};

export default AllPhotos;
