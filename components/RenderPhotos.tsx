import {Text} from 'react-native';
import React, {ReactNode} from 'react';
import {reduxState, sortedPhotosObject} from '../types/interfaces';
import RenderSortedPhotos from './RenderSortedPhotos';
import {useSelector} from 'react-redux';
import PinchAndZoom from './PinchAndZoom';
import { ScrollView } from 'react-native-gesture-handler';

interface Props {
  photos: sortedPhotosObject;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);

  const renderPhoto = (photoObject: sortedPhotosObject) => {
    let result: Array<ReactNode> = [];

    for (let condition of Object.keys(photoObject)) {
      if (condition == sortCondition) {
        result.push(
          <PinchAndZoom fromValue={1} toValue={0}>
            <RenderSortedPhotos photoObject={photoObject[condition]} />
          </PinchAndZoom>,
        );
      } else if (
        condition == 'day' ||
        condition == 'month' ||
        condition == 'week'
      ) {
        result.push(
          <PinchAndZoom fromValue={0} toValue={1}>
            <RenderSortedPhotos photoObject={photoObject[condition]} />
          </PinchAndZoom>,
        );
      }
    }
    return result;
  };

  return <ScrollView>{props.photos ? renderPhoto(props.photos) : <Text></Text>}</ScrollView>;
};

export default RenderPhotos;
