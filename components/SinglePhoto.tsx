import {Image} from 'native-base';
import React from 'react';
import {Dimensions, Modal} from 'react-native';
import FastImage from 'react-native-fast-image';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  showModal: boolean;
  setShowModal: Function;
  imageUri: string;
}

const SinglePhoto: React.FC<Props> = (props) => {
  return (
    <Modal
      onRequestClose={() => props.setShowModal(false)}
      visible={props.showModal}
      animationType="slide"
      style={{width: SCREEN_WIDTH, height: SCREEN_HEIGHT}}>
      <FastImage
        style={{
          width: SCREEN_WIDTH - 10,
          height: SCREEN_HEIGHT - 10,
          margin: 5,
        }}
        source={{uri: props.imageUri}}
      />
    </Modal>
  );
};

export default SinglePhoto;
