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
import { default as Reanimated, useAnimatedGestureHandler, interpolate, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';


interface Props {
  imageHeight: number;
  imageWidth: number;
  media:Asset|undefined;
  modalShown: Reanimated.SharedValue<number>;
  index: number;
  pinchRef: React.RefObject<React.ComponentType<PinchGestureHandlerProps & React.RefAttributes<any>>>;
  imageScale: Reanimated.SharedValue<number>;
  animatedSingleMediaIndex: Reanimated.SharedValue<number>;
}

const Media: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
  const state={
    activeIndex: -1
  }
  
  const doubleTapRef = createRef<TapGestureHandler>();
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {isMounted.current = false;}
  }, []);

  const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {x: number; y: number; scale: number;}>({
    onStart: (_event, ctx) => {
      ctx.x = translateX.value; 
      ctx.y = translateY.value;
      ctx.scale = props.imageScale.value;
    },
    onActive: (event, ctx) => {
      console.log([event.focalX, event.focalY]);
      props.imageScale.value = interpolate(ctx.scale*event.scale,
        [0, 1, 4],
        [1, 1, 4]
      );
      
      if(event.scale!==1){
        translateX.value = ctx.x + (
          (
            (
              event.scale*(SCREEN_WIDTH-event.focalX*2)
            ) - (SCREEN_WIDTH-event.focalX*2)
          )
          / (2*event.scale)) ;
        translateY.value =  ctx.y + (
          (
            (
              event.scale*(SCREEN_HEIGHT-event.focalY*2)
            ) - (SCREEN_HEIGHT-event.focalY*2)
          )
          / (2*event.scale)) ;
      }
      //console.log([imageScale.value, translateX.value, translateY.value, event.focalX, event.focalY]);
    },
    onFinish: (event) => {
      if(props.imageScale.value ===1){
        translateX.value = 0;
        translateY.value = 0;
      }
    },
    onEnd: (event)=>{

    },
    onCancel: (event) => {

    }
  });

  const _onDoubleTapHandlerStateChange = useAnimatedGestureHandler<TapGestureHandlerGestureEvent, {x: number; y: number; scale: number;}>({
    onStart: (event, ctx)=>{
      console.log('onStart');
      ctx.x = translateX.value; 
      ctx.y = translateY.value;
      ctx.scale = props.imageScale.value;
    },
    onActive: (event, ctx)=>{
      if(props.imageScale.value<2.25){
        props.imageScale.value = ctx.scale * 1.5;
        translateX.value =  ctx.x + (
          (
            (
              1.5*(SCREEN_WIDTH-event.x)
            ) - (SCREEN_WIDTH-event.x)
          )
          / (2*1.5));
        translateY.value =  ctx.y + (
          (
            (
              1.5*(SCREEN_HEIGHT-event.y)
            ) - (SCREEN_HEIGHT-event.y)
          )
          / (2*1.5));
      }else{
        props.imageScale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
      }
    }
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

      const animatedImageStyle = useAnimatedStyle(()=>{
        
        let scale = props.modalShown.value*((props.animatedSingleMediaIndex.value===props.index)?props.imageScale.value:1);
        return {
          transform: [
            {
              scale: scale,
            },
            {
             translateX: translateX.value
            },
            {
              translateY: translateY.value
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

      const animatedViewStyle = useAnimatedStyle(()=>{
        return {
          opacity: (props.modalShown.value*((props.animatedSingleMediaIndex.value===props.index)?1:(interpolate(
            props.imageScale.value,
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
