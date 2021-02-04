import {Text} from 'native-base';
import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated} from 'react-native';
import {sortedPhotosObject} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';

interface Props {
  photos: sortedPhotosObject;
  opacity: Animated.Value;
}

const AllPhotos: React.FC<Props> = (props) => {
  const renderPhotos = (photos: any) => {
    let result: Array<Element> = [];
    for (let condition of Object.keys(photos)) {
      if (condition == 'day')
        result.push(
          <RenderPhotos
            photos={photos[condition]}
            width={'45%'}
            height={200}
            numColumn={2}
            opacity={props.opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            })}
          />,
        );
      if (condition == 'week')
        result.push(
          <RenderPhotos
            opacity={props.opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            })}
            photos={photos[condition]}
            width={'30%'}
            height={50}
            numColumn={3}
          />,
        );
      if (condition == 'month')
        result.push(
          <RenderPhotos
            opacity={props.opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            })}
            photos={photos[condition]}
            width={'20%'}
            height={100}
            numColumn={4}
          />,
        );
    }

    return result;
  };

  return (
    <ScrollView>
      {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>}
    </ScrollView>
  );
};

export default AllPhotos;
