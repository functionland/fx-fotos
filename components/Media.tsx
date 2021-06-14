import React, {useState, useEffect, createRef, useRef} from 'react';
import {Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { Asset } from 'expo-media-library';
import { Video } from 'expo-av'
import VideoPlayer from './VideoPlayer';
import {
  TapGestureHandler,
  PinchGestureHandler,
  HandlerStateChangeEvent,
  PinchGestureHandlerGestureEvent,
  TapGestureHandlerGestureEvent,
  State,
  PinchGestureHandlerProps
} from 'react-native-gesture-handler';
import { default as Reanimated, useAnimatedGestureHandler, useAnimatedStyle } from 'react-native-reanimated';


interface Props {
  imageHeight: number;
  imageWidth: number;
  media:Asset|undefined;
  modalShown: Reanimated.SharedValue<number>;
  index: number;
  pinchRef: React.RefObject<React.ComponentType<PinchGestureHandlerProps & React.RefAttributes<any>>>;
  _baseImageScale: Reanimated.SharedValue<number>;
  _pinchScale: Reanimated.SharedValue<number>;
  animatedSingleMediaIndex: Reanimated.SharedValue<number>;
}

const Media: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
const state={
  activeIndex: -1
}
  
  let doubleTapRef = createRef<TapGestureHandler>();
  
  let _lastScale:number = 1;

  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {isMounted.current = false;}
  }, []);



  const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
    onActive: (event) => {

    },
    onFinish: (event) => {

    },
    onEnd: (event)=>{

    },
    onCancel: (event) => {

    }
  });

  const _onDoubleTapHandlerStateChange = useAnimatedGestureHandler<TapGestureHandlerGestureEvent, {}>({
    onStart: (event)=>{
      console.log('onStart');
    },
  });

      let video:any;
      const [isMute, setIsMute] = useState<boolean>(false);
      useEffect(()=>{
        if(video && props?.media?.duration && isMounted.current){
          if(state?.activeIndex===props.index){
            ////console.log('video unloaded');
            video?.unloadAsync();
          }else if(state?.activeIndex===props.index){
            video.loadAsync({uri: props.media?.uri},{shouldPlay: true, positionMillis: 0});
          }
        }
      }, [props.index, state?.activeIndex, state]);

      const animatedImageStyle = Reanimated.useAnimatedStyle(()=>{
        const imageScale = Reanimated.interpolate((props._baseImageScale.value* props._pinchScale.value),
          [0, 1, 4],
          [1, 1, 4]
        );
        let scale = props.modalShown.value*((props.animatedSingleMediaIndex.value===props.index)?imageScale:1);
        return {
          transform: [
            {
              scale: scale,
            }
          ]
        }
      });

      const buildMedia = (media:Asset|undefined) => {
        if(media){
          if(media?.duration > 0){ 
            return (
              <VideoPlayer
                sliderColor='whitesmoke'
                showFullscreenButton={false}
                showMuteButton={true}
                mute={() =>setIsMute(true)}
                unmute={() =>setIsMute(false)}
                isMute={isMute || !(state?.activeIndex===props.index?true:false)}
                videoProps={{
                  ref: (v: any) => (video = v),
                  shouldPlay: (state?.activeIndex===props.index),
                  isMuted: isMute,
                  resizeMode: Video.RESIZE_MODE_CONTAIN,
                  source: {
                    uri: media.uri,
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
              <Reanimated.Image
                style={[
                  styles.pinchableImage,
                  animatedImageStyle,
                  {
                    height: props.imageHeight,
                    width: props.imageWidth,
                  },
                ]}
                source={{uri: media?.uri}}
              />
            )
          }
        }else{
          return (
            <></>
          );
        }
      }

      const animatedViewStyle = Reanimated.useAnimatedStyle(()=>{
        const imageScale = Reanimated.interpolate((props._baseImageScale.value* props._pinchScale.value),
          [0, 1, 4],
          [1, 1, 4]
        );
        return {
          opacity: (props.modalShown.value*((props.animatedSingleMediaIndex.value===props.index)?1:(Reanimated.interpolate(
            imageScale,
            [0, 0.99, 1, 1.01, 4],
            [0, 0, 1, 0, 0],
          ))))
        }
      });

      return (
        <Reanimated.View
          style={{
            marginLeft: (SCREEN_WIDTH-props.imageWidth)/2,
            marginTop: (SCREEN_HEIGHT-props.imageHeight)/2,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
          }}
        >
                <TapGestureHandler
                  ref={doubleTapRef}
                  onGestureEvent={_onDoubleTapHandlerStateChange}
                  numberOfTaps={2}
                >
                  <Reanimated.View 
                    style={[styles.wrapper, 
                      {
                        width: SCREEN_WIDTH, 
                        height: SCREEN_HEIGHT,
                      }]}
                  >
                    <PinchGestureHandler
                      ref={props.pinchRef}
                      onGestureEvent={_onPinchGestureEvent}
                    >
                      <Reanimated.View 
                        style={[styles.container, 
                          animatedViewStyle,
                          {
                            width: SCREEN_WIDTH, 
                            height: SCREEN_HEIGHT,
                          }
                        ]} 
                        collapsable={false}
                      >
                        {buildMedia(props.media)}
                      </Reanimated.View>
                    </PinchGestureHandler>
                  </Reanimated.View>
                </TapGestureHandler>
              </Reanimated.View>
      );
    
  
};

const styles = StyleSheet.create({
  pinchableImage: {

  },
  video: {

  },
  wrapper:{
    position: 'relative',
    zIndex:5,
  },
  container: {
    position: 'relative',
    zIndex:5,
  },
});

export default Media;
