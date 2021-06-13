import React, { useState, useEffect, createRef, useRef } from 'react';
import {useWindowDimensions , Animated, StyleSheet, View, StatusBar, } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks'
import Media from './Media';
import { Asset } from 'expo-media-library';
import { RecyclerListView, DataProvider, BaseScrollView, } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';
import { calcImageDimension } from '../utils/functions';

import {
  LongPressGestureHandler,
  PanGestureHandler,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  State,
  ScrollView,
  PinchGestureHandler
} from 'react-native-gesture-handler';
import {
  useRecoilState,
} from 'recoil';
import {numColumnsState, mediasState, singlePhotoIndexState, imagePositionState} from '../states';
import {default as Reanimated,} from 'react-native-reanimated';

class ExternalScrollView extends BaseScrollView {
  private _scrollViewRef: any;

  scrollTo(...args: any[]) {
    if (this._scrollViewRef) { 
      this._scrollViewRef?.scrollTo(...args);
    }
  }
  render() {
    return <ScrollView  {...this.props}
    style={{zIndex:1}}
     ref={(scrollView: any) => {this._scrollViewRef = scrollView;}}
     waitFor={(this.props as any).waitFor}
     scrollEventThrottle={16}
     />
  }
}

interface Props {
  modalShown: Animated.Value;
  headerShown: Reanimated.SharedValue<number>;
}

const SingleMedia: React.FC<Props> = (props) => {
  const [medias, setMedias] = useRecoilState(mediasState);
  const [numColumns, setNumColumns] = useRecoilState(numColumnsState);
  const [singlePhotoIndex, setSinglePhotoIndex] = useRecoilState(singlePhotoIndexState);
  const [imagePosition, setImagePosition] = useRecoilState(imagePositionState);
  useEffect(()=>{
    console.log([Date.now()+': component SingleMedia'+numColumns+' rendered']);
  });
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {isMounted.current = false;props.modalShown.removeAllListeners();}
  }, []);

  const isModalShown = useRef<number>(0);
  
  const viewPosition = useRef(new Animated.ValueXY(imagePosition)).current;

  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const pinchRef = createRef<PinchGestureHandler>();

  const [media, setMedia] = useState<Asset|undefined>(undefined);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const [panGestureEnabled, setPanGestureEnabled] = useState<boolean>(true);

  const viewScale = useRef(new Animated.ValueXY({x:0,y:0})).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const scrollRef:any = useRef();
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return r1 !== r2;
  }));
  const [layoutProvider, setLayoutProvider] = useState<any>(LayoutUtil.getSingleImageLayoutProvider());
  
  const _baseImageScale = useRef(new Animated.Value(1)).current;
  const _pinchScale = useRef(new Animated.Value(1)).current;
  const imageScale:Animated.AnimatedInterpolation = Animated.multiply(_baseImageScale, _pinchScale).interpolate({
    inputRange: [0, 1, 4],
    outputRange: [1, 1, 4]
  });

  useEffect(()=>{
    if(medias && isMounted.current){
      setDataProvider(dataProvider.cloneWithRows(medias));
    }
  }, [medias]);

  useEffect(()=>{
    if(isMounted.current){
      console.log(media);
      let imageDimensions = calcImageDimension(media, SCREEN_HEIGHT, SCREEN_WIDTH);
      showHideModal(imageDimensions.width, imageDimensions.height);
      if(singlePhotoIndex>-1 && isModalShown.current===1){
        scrollRef?.current?.scrollToIndex(singlePhotoIndex, false);
      }
    }
  },[media]);

  
  useEffect(()=>{
  if(singlePhotoIndex>-1){
  props.modalShown.removeAllListeners();
  props.modalShown.addListener(({value})=>{
    console.log('modalShown changed to: '+value+', isModalShown.current='+isModalShown.current);
    if(isModalShown.current !== value){
      if(value===1){
        if(medias && isMounted.current){
          console.log('singlePhotoIndex2='+singlePhotoIndex);
          let newMedia:Asset = medias[singlePhotoIndex];
          if(newMedia && typeof newMedia !== 'string' && media !== newMedia){
            setMedia(newMedia);
          }else{
            let imageDimensions = calcImageDimension(media, SCREEN_HEIGHT, SCREEN_WIDTH);
            showHideModal(imageDimensions.width, imageDimensions.height);
          }
        }
      }
    }
  });
  }
  },[singlePhotoIndex])

  const hideModalAnimation = (duration:number=400) => {
    let imageDimensions = calcImageDimension(media, SCREEN_HEIGHT, SCREEN_WIDTH);
    let thumbnailPositionMinusSingleImagePosition = {
      x: imagePosition.x - (SCREEN_WIDTH/(numColumns*imageDimensions.width))*(SCREEN_WIDTH - imageDimensions.width)/2,
      y: imagePosition.y - (SCREEN_WIDTH/(numColumns*imageDimensions.height))*(SCREEN_HEIGHT - imageDimensions.height)/2
    };
    Animated.parallel([
      Animated.timing(viewPosition, {
        toValue: thumbnailPositionMinusSingleImagePosition,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(viewScale, {
        toValue: {x:SCREEN_WIDTH/(numColumns*imageDimensions.width), y:SCREEN_WIDTH/(numColumns*imageDimensions.height)},
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
      props.modalShown.setValue(0);
      setSinglePhotoIndex(-1);
      props.headerShown.value = 1;
      isModalShown.current=0;
      viewScale.setValue({x:0, y:0});
    }, duration/2)
  }
  const showModalAnimation = (duration:number=400) => {
    console.log('in showModalAnimation:', {SCREEN_WIDTH:SCREEN_WIDTH, SCREEN_HEIGHT:SCREEN_HEIGHT, StatusBar: StatusBar.currentHeight});
    Animated.parallel([
      Animated.timing(viewPosition, {
        //toValue: { x: (SCREEN_WIDTH-imageDimensions.width)/2, y: (SCREEN_HEIGHT-imageDimensions.height+2*(StatusBar.currentHeight||0))/2 },
        toValue: {x:0, y:(StatusBar.currentHeight||0)},
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
    isModalShown.current=1;
  }
  useBackHandler(() => {
    if (isModalShown.current===1) {
      hideModalAnimation();
      return true
    }
    // let the default thing happen
    return false
  })
  const showHideModal = (imageWidth:number, imageHeight:number) => {
    if(isModalShown.current===0){
      let thumbnailPositionMinusSingleImagePosition = {
        x: imagePosition.x - (SCREEN_WIDTH/(numColumns*imageWidth))*(SCREEN_WIDTH - imageWidth)/2,
        y: imagePosition.y - (SCREEN_WIDTH/(numColumns*imageHeight))*(SCREEN_HEIGHT - imageHeight)/2
      };
      viewPosition.setValue(thumbnailPositionMinusSingleImagePosition);

      viewScale.setValue({x:SCREEN_WIDTH/(numColumns*imageWidth), y:SCREEN_WIDTH/(numColumns*imageHeight)})
      showModalAnimation();
    }
  }

 
  let singleTapRef = createRef<PanGestureHandler>();
  
 
  const translationX = useRef(new Animated.Value(0)).current;
  const translationY = useRef(new Animated.Value(0)).current;

  let translationYvsX = Animated.multiply(translationY, Animated.divide(translationX, Animated.add(translationY,0.0000001)).interpolate({
    inputRange: [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
    outputRange: [0,             0,  0,    1, 0,    0, 0],
  }))

  
  const _onPanHandlerStateChange = ( event:HandlerStateChangeEvent<PanGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      if( (event.nativeEvent.translationY > 50 || event.nativeEvent.translationY < -50) && (((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))>0 && (event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<0.6) || ((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<0 && (event.nativeEvent.translationX/(event.nativeEvent.translationY+1))>-0.6))){
        hideModalAnimation();
      }else if(event.nativeEvent.translationY <= 50 && event.nativeEvent.translationY >= -50){
        showModalAnimation();
      }
    }else if (event.nativeEvent.oldState !== State.ACTIVE && event.nativeEvent.state === State.ACTIVE) {
      if( ((event.nativeEvent.velocityX/(event.nativeEvent.velocityY+1))>0.6) || ((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<-0.6) ){
        ////console.log('scroll started');
        setScrollEnabled(true);
        let newIndex = -1;
        if(event.nativeEvent.velocityX > 0){
          newIndex = singlePhotoIndex - 1;
        }else if(event.nativeEvent.velocityX < 0){
          newIndex = singlePhotoIndex + 1;
        }
        if(newIndex > -1 && scrollRef){
          //scrollRef?.current?.scrollToOffset(100,0,true);
        }
      }
    }
  }
  const _onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translationX, translationY: translationY } }],
    { useNativeDriver: true }
  );

  

  const _onLongTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      ////console.log('long tap');
    }
  }

  const _onVisibleIndicesChanged = (indexes:number[])=> {
    setSinglePhotoIndex(indexes[0]);
  }
  
  return (
    <Animated.View 
      style={{
        zIndex:props.modalShown, 
        opacity:props.modalShown,
        width:SCREEN_WIDTH, 
        height:SCREEN_HEIGHT,
        position:'absolute',
        top: 0,
        left: 0,
      }}
    >
      <Animated.View 
        style={[styles.ModalView, {
          opacity:modalOpacity.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 1, 1],
          }),
          width:SCREEN_WIDTH,
          height:SCREEN_HEIGHT,
          top: 0,
          left: 0,
          transform: [
            {
              translateY: Animated.subtract(Animated.add(viewPosition.y, translationYvsX),StatusBar.currentHeight||0)
            },
            {
              translateX: viewPosition.x
            },
            {
              scale: props.modalShown
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
          <Animated.View style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}>
            <PanGestureHandler
              enabled={panGestureEnabled}
              maxPointers={1}
              ref={singleTapRef}
              simultaneousHandlers={scrollRef}
              onHandlerStateChange={_onPanHandlerStateChange}
              onGestureEvent={_onPanGestureEvent}
            >
              <Animated.View style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}>
                <RecyclerListView
                  ref={scrollRef}
                  externalScrollView={ExternalScrollView}
                  isHorizontal={true}
                  dataProvider={dataProvider}
                  layoutProvider={layoutProvider}
                  renderAheadOffset={1}
                  initialRenderIndex={singlePhotoIndex}
                  onVisibleIndicesChanged={_onVisibleIndicesChanged}
                  waitFor={[pinchRef]}
                  scrollViewProps={{
                    disableIntervalMomentum: true,
                    disableScrollViewPanResponder: false,
                    horizontal: true,
                    pagingEnabled: true,
                    directionalLockEnabled: true,
                    scrollEnabled: true,
                  }}
                  extendedState={{activeIndex: singlePhotoIndex}}
                  style={{
                    width:SCREEN_WIDTH, 
                    height:SCREEN_HEIGHT,
                  }}
                  rowRenderer={(type:string | number, item:Asset, index: number, extendedState:any) => (
                    <Media
                      imageHeight={calcImageDimension(item, SCREEN_HEIGHT, SCREEN_WIDTH).height}
                      imageWidth={calcImageDimension(item, SCREEN_HEIGHT, SCREEN_WIDTH).width}
                      media={item}
                      state={extendedState}
                      modalShown={props.modalShown}
                      index={index}
                      setScrollEnabled={setScrollEnabled}
                      pinchRef={pinchRef}
                      imageScale={imageScale}
                      _baseImageScale={_baseImageScale}
                      _pinchScale={_pinchScale}
                    />
                  )}
                />
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ModalView:{
    position: 'absolute',
    zIndex:5,
  },
  pinchableImage: {

  },
  backdrop: {
    backgroundColor: 'black',
    zIndex: -1
  }
});

export default React.memo(SingleMedia);
