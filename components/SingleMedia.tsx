import React, { useState, useEffect, createRef, useRef } from 'react';
import {Dimensions, Animated, StyleSheet, View, StatusBar } from 'react-native';
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
const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  modalShown: boolean;
  setModalShown: Function;
  medias: FlatSection;
  singleMediaIndex: number;
  imagePosition: {x:number, y:number};
  numColumns: 2|3|4;
}

const SingleMedia: React.FC<Props> = (props) => {
  const [media, setMedia] = useState<Asset|undefined>(undefined);
  const [imageHeight, setImageHeight] = useState<number>(SCREEN_HEIGHT);
  const [imageWidth, setImageWidth] = useState<number>(SCREEN_WIDTH);
  const [showModal, setShowModal] = useState<boolean>(false);

  const viewPosition = useRef(new Animated.ValueXY(props.imagePosition)).current;
  const viewScale = useRef(new Animated.ValueXY({x:0,y:0})).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  let imageWidth_t = SCREEN_WIDTH;
  let imageHeight_t = SCREEN_HEIGHT;
  useEffect(()=>{
    let medias:any[] = props.medias.layout.filter(item => typeof item.value !== 'string').map((item)=>{return item.value});
    let media:Asset = medias[props.singleMediaIndex];
    if(media && typeof media !== 'string'){
      if(media.height/media.width > SCREEN_HEIGHT/SCREEN_WIDTH){
        imageWidth_t = SCREEN_WIDTH * (media.height/(media.width || 1))
        setImageWidth(imageWidth_t);
      }else{
        imageHeight_t = SCREEN_HEIGHT/(media.height/(media.width || 1))
        setImageHeight(imageHeight_t);
      }
      setMedia(media);
    }
  }, [props.medias, props.singleMediaIndex, props.modalShown]);

  useEffect(()=>{
    console.log('showModal='+showModal);
    showHideModal(showModal, imageWidth, imageHeight);
  },[showModal]);

  useEffect(()=>{
    setShowModal(props.modalShown);
  },[props.modalShown])

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
      console.log('setting modalShown to false');
      props.setModalShown(false);
      viewScale.setValue({x:0, y:0});
    }, duration/2)
  }
  const showModalAnimation = (duration:number=300) => {
    Animated.parallel([
      Animated.timing(viewPosition, {
        toValue: { x: (SCREEN_WIDTH-imageWidth)/2, y: (SCREEN_HEIGHT-imageHeight)/2 },
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
  const showHideModal = (showModal:boolean, imageWidth:number, imageHeight:number) => {
    if(showModal){
      viewPosition.setValue(props.imagePosition);
      console.log(props.imagePosition);
      viewScale.setValue({x:SCREEN_WIDTH/(props.numColumns*imageWidth), y:2*SCREEN_WIDTH/(props.numColumns*imageHeight*2)})
      console.log('opening image');
      console.log([imageWidth, imageHeight, SCREEN_WIDTH, SCREEN_HEIGHT, props.imagePosition.x, props.imagePosition.y]);
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
      if(event.nativeEvent.translationY > 50 || event.nativeEvent.translationY < -50){
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
        opacity:modalOpacity, 
        width:props.modalShown?SCREEN_WIDTH:0,
        height:props.modalShown?SCREEN_HEIGHT:0,
        top: 0,
        left: 0,
        transform: [
          {
            translateY: Animated.subtract(Animated.add(viewPosition.y, translationY),StatusBar.currentHeight||0)
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
            scale: translationY.interpolate({
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
                <View style={[styles.wrapper]}>
                  <PinchGestureHandler
                    ref={pinchRef}
                    onGestureEvent={_onPinchGestureEvent}
                    onHandlerStateChange={_onPinchHandlerStateChange}
                  >
                    <Animated.View style={[styles.container]} collapsable={false}>
                  
                      <ImageView
                        imageHeight={imageHeight}
                        imageWidth={imageWidth}
                        imageScale={imageScale}
                        media={media}
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
      {opacity: Animated.multiply(viewScale.x, translationY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [0, 1, 0],
      })).interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
      })}]}
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
    width: SCREEN_WIDTH, 
    height: SCREEN_HEIGHT,
    position: 'relative',
    zIndex:5,
  },
  container: {
    width: SCREEN_WIDTH, 
    height: SCREEN_HEIGHT,
    position: 'relative',
    zIndex:5,
  },
  pinchableImage: {

  },
  backdrop: {
    backgroundColor: 'black',
    height:  SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    zIndex: 4
  }
});

export default SingleMedia;
