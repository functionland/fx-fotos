import {Text} from 'native-base';
import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated} from 'react-native';
import {
  reduxState,
  sortedPhotos,
  sortedPhotosObject,
} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import PinchZoom from './PinchZoom';
import {useSelector} from 'react-redux';

interface Props {
  photos: sortedPhotosObject;
  distance: Animated.Value;
}

const renderPhotosWidthAnimation = (
  photos: sortedPhotos,
  width: string,
  height: number,
  numCol: number,
  distance: Animated.Value,
  hasPinchAndZoom: boolean,
) => {
  if (hasPinchAndZoom) {
    return (
      <RenderPhotos
        photos={photos}
        width={width}
        height={height}
        numColumn={numCol}
        distance={distance}
      />
    );
  } else {
    return (
      <RenderPhotos
        photos={photos}
        width={width}
        height={height}
        numColumn={numCol}
        distance={distance}
      />
    );
  }
};

const AllPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);

  const renderPhotos = (photos: any) => {
    let result: Array<Element> = [];

    for (let condition of Object.keys(photos)) {
      if (condition == sortCondition && condition == 'day')
        result.push(
          renderPhotosWidthAnimation(
            photos[condition],
            '49%',
            200,
            2,
            props.distance,
            true,
          ),
        );
      else if (condition == sortCondition && condition == 'month')
        result.push(
          renderPhotosWidthAnimation(
            photos[condition],
            '30%',
            50,
            3,
            props.distance,
            true,
          ),
        );
      else if (condition == sortCondition && condition == 'month')
        result.push(
          renderPhotosWidthAnimation(
            photos[condition],
            '24%',
            100,
            4,
            props.distance,
            true,
          ),
        );
      else if (condition == 'day')
        result.push(
          renderPhotosWidthAnimation(
            photos[condition],
            '49%',
            200,
            2,
            props.distance,
            false,
          ),
        );
      else if (condition == 'month')
        result.push(
          renderPhotosWidthAnimation(
            photos[condition],
            '30%',
            50,
            3,
            props.distance,
            false,
          ),
        );
      else if (condition == 'month')
        result.push(
          renderPhotosWidthAnimation(
            photos[condition],
            '24%',
            100,
            4,
            props.distance,
            false,
          ),
        );
    }

    return result.reverse();
  };

  return (
    <ScrollView>
      {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>}
    </ScrollView>
  );
};

export default AllPhotos;
