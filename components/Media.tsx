import React, {useState, useEffect, createRef} from 'react';
import {Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Asset } from 'expo-media-library';
import { Video } from 'expo-av'
import VideoPlayer from './VideoPlayer';
import {
  TapGestureHandler,
  PinchGestureHandler,
  HandlerStateChangeEvent,
  PinchGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';

interface Props {
  imageHeight: number;
  imageWidth: number;
  media:Asset|undefined;
  state: {modalShown:boolean}|undefined;
  activeIndex: number;
  index: number;
}

const Media: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  let pinchRef = createRef();
  let doubleTapRef = createRef();

  let _baseImageScale = new Animated.Value(1);
  let _pinchScale = new Animated.Value(1);
  let imageScale = Animated.multiply(_baseImageScale, _pinchScale);
  let _lastScale:number = 1;

  const _onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: _pinchScale } }],
    { useNativeDriver: true }
  );
  const _onPinchHandlerStateChange = ( event:HandlerStateChangeEvent<PinchGestureHandlerEventPayload> ) => {
    //console.log(event.nativeEvent);
    if (event.nativeEvent.oldState === State.ACTIVE) {
      _lastScale *= event.nativeEvent.scale;
      _baseImageScale.setValue(_lastScale);
      _pinchScale.setValue(1);
    }
  }

  const _onDoubleTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      if(_lastScale > 1){
        _lastScale = 1;
        _baseImageScale.setValue(_lastScale);
      }else{
        _lastScale *= 2;
        _baseImageScale.setValue(_lastScale);
      }
    }
  }

      let video:any;
      const [isMute, setIsMute] = useState<boolean>(false);
      useEffect(()=>{
        if(props.state){
          console.log(props.state);
        }
      },[props.state]);
      useEffect(()=>{
        if(video && props?.media?.duration){
          console.log('useEffect:', {
            'props.activeIndex':props.activeIndex,
            'props.index':props.index,
            'props.state?.modalShown':props.state?.modalShown,
            'first condition':!(props.activeIndex===props.index?true:false),
            'second condition': !props.state?.modalShown
          });
          if(!(props.activeIndex===props.index?true:false) || !props.state?.modalShown){
            console.log('video unloaded');
            video?.unloadAsync();
          }else if(props.state?.modalShown && (props.activeIndex===props.index?true:false)){
            video.loadAsync({uri: props.media?.uri},{shouldPlay: true, positionMillis: 0});
          }
        }
      }, [props.index, props.activeIndex, props.state]);

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
                isMute={isMute || !(props.activeIndex===props.index?true:false) || !props.state?.modalShown}
                videoProps={{
                  ref: (v: any) => (video = v),
                  shouldPlay: ((props.activeIndex===props.index?true:false) && props.state?.modalShown),
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
              <Animated.Image
                style={[
                  styles.pinchableImage,
                  {
                    height: props.imageHeight,
                    width: props.imageWidth,
                    transform: [
                      { scale: imageScale },
                    ],
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

  
      return (
        <Animated.View>
                <TapGestureHandler
                  ref={doubleTapRef}
                  onHandlerStateChange={_onDoubleTapHandlerStateChange}
                  numberOfTaps={2}
                >
                  <Animated.View 
                    style={[styles.wrapper, 
                      {
                        width: SCREEN_WIDTH, 
                        height: SCREEN_HEIGHT,
                      }]}
                    >
                    <PinchGestureHandler
                      ref={pinchRef}
                      onGestureEvent={_onPinchGestureEvent}
                      onHandlerStateChange={_onPinchHandlerStateChange}
                    >
                      <Animated.View 
                        style={[styles.container, 
                          {
                            width: SCREEN_WIDTH, 
                            height: SCREEN_HEIGHT,
                          }
                        ]} 
                        collapsable={false}
                      >
              {buildMedia(props.media)}
            </Animated.View>
                    </PinchGestureHandler>
                  </Animated.View>
                </TapGestureHandler>
              </Animated.View>
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
