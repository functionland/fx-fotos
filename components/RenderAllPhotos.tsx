import {Text, View} from 'native-base';
import React, {useEffect} from 'react';
import {Animated} from 'react-native';
import {useSelector} from 'react-redux';
import {
  reduxState,
  sortDetails,
  sortedPhotos,
  sortedPhotosObject,
} from '../types/interfaces';
import RenderPhotos from './RenderPhotostest';

interface Props {
  photos: sortedPhotos;
  sortDetails: Array<any>;
  distance: Animated.Value;
}

const renderPhotosComponent = (
  sortedPhotos: sortedPhotos,
  sortDetails: Array<any>,
  props: Props,
) => {
  let result: Array<any> = [];
  for (let date of Object.keys(sortedPhotos)) {
    result.push(
      <RenderPhotos
        title={date}
        distance={props.distance}
        widthInputRange={[0, 200]}
        widthOutputRange={['33%', '48%']}
        opacityInputRange={[0, 100]}
        opacityOutputRange={[1, 0]}
        photosArray={sortedPhotos[date]}
        height={props.sortDetails[0].height}
      />,
    );
  }

  return result;
};

const RenderAllPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);

  return (
    <View>
      {props.photos ? (
        renderPhotosComponent(props.photos, props.sortDetails, props)
      ) : (
        <Text>ERROR</Text>
      )}
    </View>
  );
};

export default RenderAllPhotos;
