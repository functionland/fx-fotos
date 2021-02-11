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
  distance: Animated.Value;
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
            <Animated.Image
              key={item.node.image.uri}
              source={{uri: item.node.image.uri}}
              style={{
                width: props.width,
                height: props.height,
                margin: props.distance.interpolate({
                  inputRange: [-200, 500],
                  outputRange: [0, 50],
                }),
              }}
            />
          )}
        />,
      );
    }
    return result;
  };

  return (
    <Animated.View
      style={{
        // position: 'absolute',
        opacity: props.distance.interpolate({
          inputRange: [-200, 0, 200],
          outputRange: [0, 1, 0],
        }),
        width: SCREEN_WIDTH,
      }}>
      {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>}
    </Animated.View>
  );
};

export default RenderPhotos;
