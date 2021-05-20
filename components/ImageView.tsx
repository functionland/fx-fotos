import React from 'react';
import {Animated, StyleSheet } from 'react-native';
import { Asset } from 'expo-media-library';
import { Video } from 'expo-av'
import VideoPlayer from './VideoPlayer';

interface Props {
  imageHeight: number;
  imageWidth: number;
  imageScale: Animated.AnimatedMultiplication;
  media:Asset|undefined;
}

const ImageViewer: React.FC<Props> = (props) => {
  if(props.media){
    if(props.media?.duration > 0){
      const video = React.useRef(null);
      return (
        <VideoPlayer
          videoProps={{
            shouldPlay: true,
            resizeMode: Video.RESIZE_MODE_CONTAIN,
            source: {
              uri: props.media.uri,
            },
          }}
          inFullscreen={false}
          height= {props.imageHeight}
          width= {props.imageWidth}
        />
      );
    }else{
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
    }
  }else{
    return (
      <></>
    );
  }
};

const styles = StyleSheet.create({
  pinchableImage: {

  },
  video: {

  }
});

export default ImageViewer;
