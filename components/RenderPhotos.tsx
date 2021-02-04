import {Image, Text, View} from 'native-base';
import React, {ReactElement} from 'react';
import FastImage from 'react-native-fast-image';
import {FlatList, Dimensions, Animated} from 'react-native';
import {sortedPhotos} from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('screen').width;

interface Props {
  photos: sortedPhotos;
  width: string;
  height: number;
  numColumn: number;
  opacity: Animated.AnimatedInterpolation;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const renderPhotos = (photos: sortedPhotos) => {
    let result = [];
    for (let date of Object.keys(photos)) {
      result.push(
        <FlatList
          key={date}
          data={photos[date]}
          numColumns={props.numColumn}
          ListHeaderComponent={<Text>{date}</Text>}
          renderItem={({item}) => (
            <FastImage
              key={item.node.image.uri}
              source={{uri: item.node.image.uri}}
              style={{
                width: props.width,
                height: props.height,
                margin: 5,
              }}
            />
          )}
        />,
      );
    }
    return result;
  };

  return (
    <Animated.View style={{opacity: props.opacity}}>
      {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>}
    </Animated.View>
  );
};

export default RenderPhotos;
