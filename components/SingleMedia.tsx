import React, { useState, useEffect, createRef, useRef } from 'react';
import {useWindowDimensions , Animated, StyleSheet, View, StatusBar } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks'
import ImageView from './ImageView';
import { Asset } from 'expo-media-library';
import { FlatSection } from '../types/interfaces';
import {
  LongPressGestureHandler,
  TapGestureHandler,
  PinchGestureHandler,
  PanGestureHandler,
  HandlerStateChangeEvent,
  PinchGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';

interface Props {
  modalShown: boolean;
  setModalShown: Function;
  medias: FlatSection;
  singleMediaIndex: number;
  imagePosition: {x:number, y:number};
  numColumns: 2|3|4;
}

const SingleMedia: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const [media, setMedia] = useState<Asset|undefined>(undefined);
  const [imageHeight, setImageHeight] = useState<number>(SCREEN_HEIGHT);
  const [imageWidth, setImageWidth] = useState<number>(SCREEN_WIDTH);
  const [showModal, setShowModal] = useState<boolean>(false);

  const viewPosition = useRef(new Animated.ValueXY(props.imagePosition)).current;
  const viewScale = useRef(new Animated.ValueXY({x:0,y:0})).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  
  useEffect(()=>{
    let imageWidth_t = SCREEN_WIDTH;
    let imageHeight_t = SCREEN_HEIGHT;
    let medias:any[] = props.medias.layout.filter(item => typeof item.value !== 'string').map((item)=>{return item.value});
    let media:Asset = medias[props.singleMediaIndex];
    if(media && typeof media !== 'string'){
      if(media.height > SCREEN_HEIGHT && media.width > SCREEN_WIDTH){
        if(media.height/media.width > SCREEN_HEIGHT/SCREEN_WIDTH){
          imageWidth_t = media.width * SCREEN_HEIGHT/(media.height==0?1:media.height);
        }else{
          imageHeight_t = SCREEN_WIDTH * media.height/(media.width==0?1:media.width);
        }
      }else if(media.height > SCREEN_HEIGHT){
        imageWidth_t = media.width * SCREEN_HEIGHT/(media.height==0?1:media.height);
      }else if(media.width > SCREEN_WIDTH){
        imageHeight_t = SCREEN_WIDTH * media.height/(media.width==0?1:media.width);
      }else if(media.height <= SCREEN_HEIGHT && media.width <= SCREEN_WIDTH){
        imageHeight_t = media.height;
        imageWidth_t = media.width ;
      }
      setImageWidth(imageWidth_t);
      setImageHeight(imageHeight_t);
      setMedia(media);
      //console.log('SCREEN_WIDTH='+SCREEN_WIDTH+', SCREEN_HEIGHT='+SCREEN_HEIGHT+', media.width='+media.width
      //+', media.height='+media.height+', imageWidth_t='+imageWidth_t+', imageHeight_t='+imageHeight_t);
    }
  }, [props.medias, props.singleMediaIndex, props.modalShown, SCREEN_WIDTH, SCREEN_HEIGHT]);

  useEffect(()=>{
    //console.log('showModal with parameters:', {showModal:showModal, imageWidth:imageWidth, imageHeight:imageHeight})
    showHideModal(showModal, imageWidth, imageHeight);
  },[showModal]);

  useEffect(()=>{
    setShowModal(props.modalShown);
  },[props.modalShown]);

  const hideModalAnimation = (duration:number=400) => {
    Animated.parallel([
      Animated.timing(viewPosition, {
        toValue: props.imagePosition,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(viewScale, {
        toValue: {x:SCREEN_WIDTH/(props.numColumns*imageWidth), y:2*SCREEN_WIDTH/(props.numColumns*imageHeight*2)},
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translationY, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translationX, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start(()=>{
      
    });
    setTimeout(()=>{
      props.setModalShown(false);
      viewScale.setValue({x:0, y:0});
    }, duration/2)
  }
  const showModalAnimation = (duration:number=300) => {
    //console.log('in showModalAnimation:', {SCREEN_WIDTH:SCREEN_WIDTH, imageWidth:imageWidth, SCREEN_HEIGHT:SCREEN_HEIGHT, imageHeight:imageHeight, StatusBar: StatusBar.currentHeight});
    Animated.parallel([
      Animated.timing(viewPosition, {
        toValue: { x: (SCREEN_WIDTH-imageWidth)/2, y: (SCREEN_HEIGHT-imageHeight+2*(StatusBar.currentHeight||0))/2 },
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(viewScale, {
        toValue: { x: 1, y: 1},
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translationY, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start();
  }
  useBackHandler(() => {
    if (props.modalShown) {
      hideModalAnimation();
      return true
    }
    // let the default thing happen
    return false
  })
  const showHideModal = (showModal:boolean, imageWidth:number, imageHeight:number) => {
    if(showModal){
      viewPosition.setValue(props.imagePosition);
      viewScale.setValue({x:SCREEN_WIDTH/(props.numColumns*imageWidth), y:2*SCREEN_WIDTH/(props.numColumns*imageHeight*2)})
      showModalAnimation();
    }else{
      console.log('closing image');
    }
  }

  let pinchRef = createRef();
  let singleTapRef = createRef();
  let doubleTapRef = createRef();
  let _baseImageScale = new Animated.Value(1);
  let _pinchScale = new Animated.Value(1);
  let imageScale = Animated.multiply(_baseImageScale, _pinchScale);
  let _lastScale:number = 1;
  let translationX = new Animated.Value(0);
  let translationY = new Animated.Value(0);

  let translationYvsX = Animated.multiply(translationY, Animated.divide(translationX, Animated.add(translationY,0.0000001)).interpolate({
    inputRange: [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
    outputRange: [0,             0,  0,    1, 0,    0, 0],
  }))

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
  const _onPanHandlerStateChange = ( event:HandlerStateChangeEvent<PanGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      if( (event.nativeEvent.translationY > 50 || event.nativeEvent.translationY < -50) && (((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))>0 && (event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<0.6) || ((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<0 && (event.nativeEvent.translationX/(event.nativeEvent.translationY+1))>-0.6))){
        hideModalAnimation();
      }else if(event.nativeEvent.translationY <= 50 && event.nativeEvent.translationY >= -50){
        showModalAnimation();
      }
    }
  }
  const _onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translationX, translationY: translationY } }],
    { useNativeDriver: true }
  );

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

  const _onLongTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      console.log('long tap');
    }
  }

  return (
    <View style={{zIndex:props.modalShown?1:0, width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}>
    <Animated.View 
      style={[styles.ModalView, {
        opacity:modalOpacity.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 1, 1],
        }), 
        width:props.modalShown?SCREEN_WIDTH:0,
        height:props.modalShown?SCREEN_HEIGHT:0,
        top: 0,
        left: 0,
        transform: [
          {
            translateY: Animated.subtract(Animated.add(viewPosition.y, translationYvsX),StatusBar.currentHeight||0)
          },
          {
            translateX: viewPosition.x
          }
        ],
      }]}
    >
    <Animated.View 
      style={[ {
        //opacity:modalOpacity, 
        position: 'relative',
        width:'100%',
        height:'100%',
        top: 0,
        left: 0,
        transform: [
          {
            scale: translationYvsX.interpolate({
              inputRange: [-SCREEN_HEIGHT, -100, 0, 100, SCREEN_HEIGHT],
              outputRange: [0.9, 0.9, 1, 0.9, 0.9],
            }),
          },
          { 
            scaleX: viewScale.x
          },
          {
            scaleY: viewScale.y,
          },
          {
            translateX: Animated.divide(
              Animated.subtract(
                Animated.multiply(
                  viewScale.x,SCREEN_WIDTH), 
                SCREEN_WIDTH)
              , Animated.multiply(2,Animated.add(viewScale.x, 0.000001)))
          },
          {
            translateY: Animated.divide(
              Animated.subtract(
                Animated.multiply(
                  viewScale.y,(SCREEN_HEIGHT)
                ), (SCREEN_HEIGHT)
              )
              , Animated.multiply(2,Animated.add(viewScale.y, 0.000001)))
          }
        ],
      }]}
    >
      <LongPressGestureHandler
        onHandlerStateChange={_onLongTapHandlerStateChange}
        minDurationMs={800}
      >
        <Animated.View>
          <PanGestureHandler
            maxPointers={1}
            ref={singleTapRef}
            onHandlerStateChange={_onPanHandlerStateChange}
            onGestureEvent={_onPanGestureEvent}
          >
            <Animated.View>
              <TapGestureHandler
                ref={doubleTapRef}
                onHandlerStateChange={_onDoubleTapHandlerStateChange}
                numberOfTaps={2}
              >
                <View 
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
                  
                      <ImageView
                        imageHeight={imageHeight}
                        imageWidth={imageWidth}
                        imageScale={imageScale}
                        media={media}
                        showModal={showModal}
                      />
                    </Animated.View>
                  </PinchGestureHandler>
                </View>
              </TapGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </LongPressGestureHandler>
    </Animated.View>
    </Animated.View>
    <Animated.View style={[styles.backdrop, 
      {
        opacity: Animated.multiply(viewScale.x, translationYvsX.interpolate({
          inputRange: [-100, 0, 100],
          outputRange: [0, 1, 0],
        })).interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        }),
        height:  SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
      }]}
    >

    </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  ModalView:{
    position: 'absolute',
    zIndex:5,
  },
  wrapper:{
    position: 'relative',
    zIndex:5,
  },
  container: {
    position: 'relative',
    zIndex:5,
  },
  pinchableImage: {

  },
  backdrop: {
    backgroundColor: 'black',
    zIndex: 4
  }
});

export default SingleMedia;
