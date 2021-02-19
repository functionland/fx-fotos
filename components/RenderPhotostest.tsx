import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {Text, View} from 'native-base';
import React from 'react';
import {Animated, Dimensions} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('screen').width;

const renderSortedPhotos = (
  photosArray: Array<PhotoIdentifier>,
  distance: Animated.Value,
  widthInputRange: Array<number>,
  widthOutputRange: Array<string>,
  opacityInputRange: Array<number>,
  opacityOutputRange: Array<number>,
  height: number,
) => {
  let result: Array<any> = [];
  photosArray.map((photo) =>
    result.push(
      <TouchableWithoutFeedback>
        <Animated.Image
          key={photo.node.image.uri}
          source={{uri: photo.node.image.uri}}
          style={{
            margin: 2,
            width: distance.interpolate({
              inputRange: widthInputRange,
              outputRange: widthOutputRange,
            }),
            height: height,
            opacity: distance.interpolate({
              inputRange: opacityInputRange,
              outputRange: opacityOutputRange,
            }),
          }}
        />
      </TouchableWithoutFeedback>,
    ),
  );

  return result;
};

interface Props {
  photosArray: Array<PhotoIdentifier>;
  distance: Animated.Value;
  widthInputRange: Array<number>;
  widthOutputRange: Array<string>;
  opacityInputRange: Array<number>;
  opacityOutputRange: Array<number>;
  title: string;
  height: number;
}

const RenderPhotos: React.FC<Props> = (props) => {
  return (
    <View>
      <Animated.Text
        style={{
          opacity: props.distance.interpolate({
            inputRange: props.opacityInputRange,
            outputRange: props.opacityOutputRange,
          }),
        }}>
        {props.title}
      </Animated.Text>
      <View style={{width: SCREEN_WIDTH, flexWrap: 'wrap', flex: 1, flexDirection: "row"}}>
        {renderSortedPhotos(
          props.photosArray,
          props.distance,
          props.widthInputRange,
          props.widthOutputRange,
          props.opacityInputRange,
          props.opacityOutputRange,
          props.height,
        )}
      </View>
    </View>
  );
};

export default RenderPhotos;
