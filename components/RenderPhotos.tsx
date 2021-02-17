import {Text, View} from 'native-base';
import React, {ReactElement, useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {FlatList, Dimensions, Animated, Modal, Image} from 'react-native';
import {sortedPhotos} from '../types/interfaces';
import {TouchableOpacity} from 'react-native-gesture-handler';
import SinglePhoto from './SinglePhoto';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: sortedPhotos;
  width: number;
  height: number;
  numColumn: number;
  distance: Animated.Value;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string>();

  useEffect(() => {
    if (imageUri !== '') {
      setShowModal(true);
    }
  }, [imageUri]);

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
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / props.numColumn}}
              onPress={(event) => {
                setImageUri(item.node.image.uri);
                setShowModal(true);
              }}>
              <Animated.Image
                key={item.node.image.uri}
                source={{uri: item.node.image.uri}}
                style={{
                  // width: props.distance.interpolate({
                  // inputRange: [0, 500],
                  // outputRange: [`${props.width}%`, `${props.width / 2}%`],
                  // }),
                  height: props.height,
                  margin: 2,
                }}
              />
            </TouchableOpacity>
          )}
        />,
      );
    }
    return result;
  };

  return (
    <Animated.View
      style={{
        opacity:
          props.numColumn === 2
            ? props.distance.interpolate({
                inputRange: [-200, 0, 200],
                outputRange: [0, 1, 0],
              })
            : props.distance.interpolate({
                inputRange: [-200, 0, 200],
                outputRange: [1, 0, 1],
              }),
        width: SCREEN_WIDTH,
      }}>
      {props.photos ? renderPhotos(props.photos) : <Text>ERROR</Text>}
      {imageUri && showModal ? (
        <SinglePhoto
          showModal={showModal}
          setShowModal={setShowModal}
          imageUri={imageUri}
        />
      ) : (
        void 0
      )}
    </Animated.View>
  );
};

export default RenderPhotos;
