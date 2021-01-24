import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native-gesture-handler';
import {Animated} from 'react-native';

interface Props {
  photoObject: {[key: string]: Array<PhotoIdentifier>};
  pinchScale: number;
}

const renderComponent = (props: Props) => {
  const [imageWidth, setImageWidth] = useState(new Animated.Value(0));

  // useEffect(() => {
  // setImageWidth('30%')
  // }, [])

  useEffect(() => {
    if (props.pinchScale > 1) {
      Animated.timing(imageWidth, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
      // imageWidth.setValue(props.pinchScale);
      // console.log('hi');
    } else if (props.pinchScale < 1) {
      Animated.timing(imageWidth, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [props.pinchScale]);

  let result: Array<Element> = [];

  for (let photoTitle of Object.keys(props.photoObject)) {
    // result.push();
    result.push(
      <Animated.ScrollView
        style={{
          opacity: imageWidth.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.1],
          }),
          // width: viewScale.interpolate({
          //   inputRange: [1, 2],
          //   outputRange: [1, 5],
          // }),
        }}>
        <Text>{photoTitle}</Text>
        <Animated.FlatList
          key={photoTitle}
          data={props.photoObject[photoTitle]}
          // style={{flex: 1}}
          numColumns={3}
          renderItem={({item}) => (
            <Animated.Image
              key={item.node.image.uri}
              source={{uri: item.node.image.uri}}
              style={{
                width: imageWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 150],
                }),
                height: imageWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 150],
                }),
              }}
            />
          )}
        />
      </Animated.ScrollView>,
    );
  }
  console.log('hello', result);

  return result;
};

const RenderSortedPhotos: React.FC<Props> = (props) => {
  return <>{renderComponent(props)}</>;
};

export default RenderSortedPhotos;
