import React from 'react';
import {Animated, StyleSheet } from 'react-native';
import { Asset } from 'expo-media-library';

interface Props {
  imageHeight: number;
  imageWidth: number;
  imageScale: Animated.AnimatedMultiplication;
  media:Asset|undefined;
}

const ImageViewer: React.FC<Props> = (props) => {

  return (
    <Animated.Image
                style={[
                  styles.pinchableImage,
                  {
                    height: props.imageHeight,
                    width: props.imageWidth,
                    transform: [
                      { scale: props.imageScale },
                    ],
                  },
                ]}
                source={{uri: props.media?.uri}}
              />
  );
};

const styles = StyleSheet.create({
  pinchableImage: {

  }
});

export default ImageViewer;
