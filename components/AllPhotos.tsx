import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated} from 'react-native';
import {
  reduxState,
  sortCondition,
  sortedPhotosObject,
} from '../types/interfaces';
import RenderPhotos from './RenderPhotostest';
import {useSelector} from 'react-redux';
import RenderAllPhotos from './RenderAllPhotos';

interface Props {
  photos: sortedPhotosObject;
  distance: Animated.Value;
}

let sortDetails = [
  {sortCode: 'month', width: 30, height: 150},
  {sortCode: 'day', width: 48, height: 200},
];

const AllPhotos: React.FC<Props> = (props) => {
  const sortCondition = useSelector((state: reduxState) => state.sortCondition);
  // const [sortDetails, setSortDetails] = useState<sortDetails>();

  // useEffect(() => {
  //   switch (sortCondition) {
  //     case 'day':
  //       setSortDetails({});
  //     case 'month':
  //       setSortDetails({});

  //     default:
  //       setSortDetails({
  //         sortCode: 'day',
  //         width: 48,
  //         height: 200,
  //       });
  //   }
  // }, [sortCondition]);

  return (
    <ScrollView>
      {/* {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>} */}
      <RenderAllPhotos
        photos={props.photos['day']}
        distance={props.distance}
        sortDetails={sortDetails}
      />
      <RenderAllPhotos
        photos={props.photos['month']}
        distance={props.distance}
        sortDetails={sortDetails}
      />
    </ScrollView>
  );
};

export default AllPhotos;
