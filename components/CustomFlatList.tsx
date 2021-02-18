import {PhotoIdentifier} from '@react-native-community/cameraroll';
import React from 'react';
import {
  Image,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: Array<PhotoIdentifier>;
  width: number;
  height: number;
  distance: Animated.Value;
  title: string;
}

const CustomFlatList: React.FC<Props> = (props) => {
  const renderPhotos = (photosArray: Array<PhotoIdentifier>) => {
    let result = photosArray.map((photo) => (
      <TouchableWithoutFeedback
        style={{width: `${props.width}%`, height: props.height, margin: 3}}
        onPress={() => console.log(photo.node.type)}
        onLongPress={() => console.log(photo.node.image.playableDuration)}>
        <Image
          style={{width: `${props.width}%`, height: props.height, margin: 3}}
          source={{uri: photo.node.image.uri}}
        />
      </TouchableWithoutFeedback>
    ));

    return result;
  };
  return (
    <Animated.View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        opacity: props.distance.interpolate({
          inputRange: [0, 200],
          outputRange: [1, 0],
        }),
      }}>
      <Text>{props.title}</Text>
      <View
        style={{
          flexWrap: 'wrap',
          margin: 3,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexDirection: "row"
        }}>
        {props.photos ? renderPhotos(props.photos) : <View></View>}
      </View>
    </Animated.View>
  );
};

export default CustomFlatList;
