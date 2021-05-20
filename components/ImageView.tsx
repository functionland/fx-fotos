import React, {useState, useEffect, useRef} from 'react';
import {Animated, StyleSheet } from 'react-native';
import { Asset } from 'expo-media-library';
import { Video } from 'expo-av'
import VideoPlayer from './VideoPlayer';

interface Props {
  imageHeight: number;
  imageWidth: number;
  imageScale: Animated.AnimatedMultiplication;
  media:Asset|undefined;
  showModal: boolean;
}

const ImageViewer: React.FC<Props> = (props) => {
  if(props.media){
    if(props.media?.duration > 0){
      let video:any;
      const [isMute, setIsMute] = useState<boolean>(false);

      useEffect(()=>{
        if(video){
          if(!props.showModal){
            video?.unloadAsync();
          }else{
            video.loadAsync({uri: props.media?.uri},{shouldPlay: true, positionMillis: 0});
          }
        }
      }, [props.showModal])
      return (
        <VideoPlayer
          sliderColor='whitesmoke'
          showFullscreenButton={false}
          showMuteButton={true}
          mute={() =>setIsMute(true)}
          unmute={() =>setIsMute(false)}
          isMute={isMute || !props.showModal}
          videoProps={{
            ref: (v: any) => (video = v),
            shouldPlay: props.showModal,
            isMuted: isMute,
            resizeMode: Video.RESIZE_MODE_CONTAIN,
            source: {
              uri: props.media.uri,
            },
          }}
          inFullscreen={false}
          height= {props.imageHeight}
          width= {props.imageWidth}
          fadeOutDuration={2000}
          quickFadeOutDuration={2000}
          showControlsOnLoad={true}
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
