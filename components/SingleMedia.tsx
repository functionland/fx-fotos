import React, { useState, useEffect, createRef, useRef } from 'react';
import {useWindowDimensions , Animated, StyleSheet, BackHandler, View, } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks'
import Media from './Media';
import { Asset } from 'expo-media-library';
import { RecyclerListView, DataProvider, BaseScrollView, } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';
import { calcImageDimension } from '../utils/functions';
import SingleMediaTopActions from './SingleMediaTopActions';

import {
  LongPressGestureHandler,
  PanGestureHandler,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  State,
  ScrollView,
  PinchGestureHandler,
  NativeViewGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {
  useRecoilState,
} from 'recoil';
import {numColumnsState, mediasState, singlePhotoIndexState, imagePositionState} from '../states';
import {default as Reanimated, useAnimatedReaction, useAnimatedGestureHandler, useSharedValue, useAnimatedRef, useDerivedValue, scrollTo as reanimatedScrollTo, call, useCode} from 'react-native-reanimated';

class ExternalScrollView extends BaseScrollView {
  scrollTo(...args: any[]) {
    //if ((this.props as any).scrollRefExternal?.current) { 
      (this.props as any).scrollRefExternal?.current?.scrollTo(...args);
      //reanimatedScrollTo((this.props as any).scrollRefExternal, 0, args[0].y, true);
      //(this.props as any).scroll.value = args[0].y;
    //}
  }
  render() {
    return (
      <Reanimated.ScrollView {...this.props}
        style={{zIndex:1}}
        ref={(this.props as any).scrollRefExternal}
        scrollEventThrottle={16}
        //nestedScrollEnabled = {true}
        //waitFor={(this.props as any).waitFor}
        ////onScroll={(this.props as any)._onScrollExternal}
        ////onScroll={Reanimated.event([(this.props as any).animatedEvent], {listener: this.props.onScroll, useNativeDriver: true})}
      >
        {this.props.children}
      </Reanimated.ScrollView>
    );
  }
}

interface Props {
  modalShown: Reanimated.SharedValue<number>;
  headerShown: Reanimated.SharedValue<number>;
  animatedImagePositionX: Reanimated.SharedValue<number>;
  animatedImagePositionY: Reanimated.SharedValue<number>;
  animatedSingleMediaIndex: Reanimated.SharedValue<number>;
  singleImageWidth: Reanimated.SharedValue<number>;
  singleImageHeight: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
}

const SingleMedia: React.FC<Props> = (props) => {
  const [medias, setMedias] = useRecoilState(mediasState);
  const backHandler = useRef<any>();
  useEffect(()=>{
    console.log([Date.now()+': component SingleMedia rendered']);
  });
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {isMounted.current = false;backHandler.current?.remove();}
  }, []);

  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const pinchRef = createRef<PinchGestureHandler>();
  const duration = 250;
  const hideActions = useSharedValue(0);

  const scrollRef:any = useRef();
  const scrollRefExternal = useAnimatedRef<Reanimated.ScrollView>();
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return r1.index !== r2.index;
  }));
  const [layoutProvider, setLayoutProvider] = useState<any>(LayoutUtil.getSingleImageLayoutProvider());

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const thumbnailPositionMinusSingleImagePositionX = useDerivedValue(() => {
    return props.animatedImagePositionX.value - Math.abs((SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageWidth.value))*(SCREEN_WIDTH - props.singleImageWidth.value)/2);
    //thumbnailPositionMinusSingleImagePositionY.value = props.animatedImagePositionY.value - (SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value))*(SCREEN_WIDTH - props.singleImageHeight.value)/2;
    //positionX.value = (isModalOpen.value*(SCREEN_WIDTH-props.singleImageWidth.value)/2) + (isModalOpen.value===0?1:0)*(thumbnailPositionMinusSingleImagePositionX.value);
    //viewScaleX.value = (isModalOpen.value===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageWidth.value)) + isModalOpen.value;
    //positionY.value = (isModalOpen.value*(SCREEN_HEIGHT-props.singleImageHeight.value)/2) + (isModalOpen.value===0?1:0)*(thumbnailPositionMinusSingleImagePositionY.value);
    //viewScaleY.value = (isModalOpen.value===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value)) + isModalOpen.value;
  },[props.animatedImagePositionX,props.numColumnsAnimated,props.singleImageWidth]);

  const thumbnailPositionMinusSingleImagePositionY = useDerivedValue(() => {
    return props.animatedImagePositionY.value - Math.abs((SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value))*(SCREEN_WIDTH - props.singleImageHeight.value)/2);
    //positionX.value = (isModalOpen.value*(SCREEN_WIDTH-props.singleImageWidth.value)/2) + (isModalOpen.value===0?1:0)*(thumbnailPositionMinusSingleImagePositionX.value);
    //viewScaleX.value = (isModalOpen.value===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageWidth.value)) + isModalOpen.value;
    //positionY.value = (isModalOpen.value*(SCREEN_HEIGHT-props.singleImageHeight.value)/2) + (isModalOpen.value===0?1:0)*(thumbnailPositionMinusSingleImagePositionY.value);
    //viewScaleY.value = (isModalOpen.value===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value)) + isModalOpen.value;
  },[props.animatedImagePositionY,props.numColumnsAnimated,props.singleImageHeight]);
  
  const isModalOpen = useDerivedValue(() => {
    if(props.modalShown.value){
      return Reanimated.withDelay(1, 
        Reanimated.withTiming(props.modalShown.value, {
        duration: 0,
      }));
    }else{
      
      translationX.value = Reanimated.withTiming(0, {
        duration: duration,
      });
      translationY.value = Reanimated.withTiming(0, {
        duration: duration,
      });
      return Reanimated.withDelay(duration, 
        Reanimated.withTiming(props.modalShown.value, {
        duration: 0,
      }));
    }
  }, [
    props.modalShown, 
  ]);

  const _setBackHandler = () => {
    backHandler.current = BackHandler.addEventListener(
      "hardwareBackPress",
      ()=>{
        props.modalShown.value = 0;
        return true;
      }
    );
  }
  const _removeBackHandler = () => {
    backHandler.current?.remove();
  }
  useAnimatedReaction(() => {
    return isModalOpen.value;
  }, (result, previous) => {
    if (result !== previous) {
      if(result){
        console.log('setting BackHandler');
        Reanimated.runOnJS(_setBackHandler)();
      }else{
        Reanimated.runOnJS(_removeBackHandler)();
      }
    }
  }, [isModalOpen]);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  useAnimatedReaction(() => {
    return thumbnailPositionMinusSingleImagePositionX.value*3+thumbnailPositionMinusSingleImagePositionY.value*7;
  }, (result, previous) => {
    if (result !== previous) {
      positionX.value = thumbnailPositionMinusSingleImagePositionX.value;
      positionY.value = thumbnailPositionMinusSingleImagePositionY.value;
    }
  }, [thumbnailPositionMinusSingleImagePositionX, thumbnailPositionMinusSingleImagePositionY]);
  
  useDerivedValue(() => {
    positionX.value = Reanimated.withTiming((props.modalShown.value===0?1:0)*(thumbnailPositionMinusSingleImagePositionX.value) + (props.modalShown.value*(SCREEN_WIDTH-props.singleImageWidth.value)/2), {
      duration: duration,
    });
  }, [
    props.modalShown, 
    thumbnailPositionMinusSingleImagePositionX,
    isModalOpen
  ]);
  
  useDerivedValue(() => {
    positionY.value = Reanimated.withTiming((props.modalShown.value===0?1:0)*(thumbnailPositionMinusSingleImagePositionY.value) + (props.modalShown.value*(SCREEN_HEIGHT-props.singleImageHeight.value)/2), {
      duration: duration,
    });
  }, [
    props.modalShown, 
    thumbnailPositionMinusSingleImagePositionY,
    isModalOpen
  ]);

  
  const opacity = useSharedValue(0);
  

  const imageScale = useSharedValue(1);

  useDerivedValue(() => {
    reanimatedScrollTo(scrollRefExternal, SCREEN_WIDTH * props.animatedSingleMediaIndex.value, 0, false);
  });

  useEffect(()=>{
    if(medias && isMounted.current){
      setDataProvider(dataProvider.cloneWithRows(medias));
    }
  }, [medias]);
  
  const viewScaleX = useSharedValue((SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageWidth.value)));
  const viewScaleY = useSharedValue((SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value)));

  const changeModalState = (result:number) => {
    /*props.modalShown.value = result;
    viewScaleY.value = Reanimated.withTiming((result===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value)) + result, {
      duration: duration,
    });
    viewScaleX.value = Reanimated.withTiming((result===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageWidth.value)) + result, {
      duration: duration,
    });
    opacity.value = Reanimated.withTiming(result, {
      duration: duration,
    });
    if (result === 0 ) {
      props.headerShown.value = 1;
    }else if(result === 1 ){
      props.headerShown.value = 0;
    }*/
  }
  useAnimatedReaction(() => {
    return props.modalShown.value;
  }, (result, previous) => {
    if(result !== previous){
      console.log('modalShown animation started');
      viewScaleY.value = Reanimated.withTiming((result===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageHeight.value)) + result, {
        duration: duration,
      });
      viewScaleX.value = Reanimated.withTiming((result===0?1:0)*(SCREEN_WIDTH/(props.numColumnsAnimated.value*props.singleImageWidth.value)) + result, {
        duration: duration,
      });
      opacity.value = Reanimated.withTiming(result, {
        duration: duration,
      });
      if (result === 0 ) {
        props.headerShown.value = 1;
      }else if(result === 1 ){
        props.headerShown.value = 0;
      }
    }
  }, [props.modalShown]);

  const singleTapRef = createRef<PanGestureHandler>();
  const nativeViewRef = createRef<PanGestureHandler>();

  const _onPanGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, {failOrEnd:boolean;}>({
    onStart: (event, ctx)=> {
      console.log('SingleMedia onStart');
      ctx.failOrEnd = false;
    },
    onActive: (event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    },
    onFinish: (event, ctx) => {
      console.log('SingleMedia onFinish');
      if(!ctx.failOrEnd){
        if(hideActions.value===0){
          hideActions.value = 1;
        }else{
          hideActions.value = 0;
        }
      }
      const translationYvsX = event.translationY*Reanimated.interpolate(
        (event.translationX/ (event.translationY+0.0000001)),
        [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
        [0,             0,  0,    1, 0,    0, 0],
      );
      if(Math.abs(translationYvsX)>=40){
        props.modalShown.value = 0;
        
      }else{
        translationY.value = Reanimated.withTiming(0,{duration:50});
      }
    },
    onEnd: (event, ctx)=>{
      console.log('SingleMedia onEnd');
      ctx.failOrEnd = true;
    },
    onCancel: (event) => {
      console.log('SingleMedia onCancel');
    },
    onFail: (event, ctx) => {
      console.log('SingleMedia onFail');
      ctx.failOrEnd = true;
    },
  });

  const _onLongTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      ////console.log('long tap');
    }
  }

  const mainAnimatedStyle = Reanimated.useAnimatedStyle(()=>{
    return {
      opacity: isModalOpen.value,
      zIndex: isModalOpen.value,
    }
  });
  const topActionsAnimatedStyle = Reanimated.useAnimatedStyle(()=> {
    return {
      transform: [
        {
          translateY: Reanimated.withTiming(hideActions.value * -50, {duration:100})
        }
      ]
    }
  })
  const subAnimatedStyle = Reanimated.useAnimatedStyle(()=>{
    
    return {
      opacity: opacity.value,
      transform: [
        {
          translateY: positionY.value
        },
        {
          translateX: positionX.value
        }
      ]
    }
  });
  const recyclerAnimatedStyle = Reanimated.useAnimatedStyle(()=>{
    const translationYvsX = translationY.value*Reanimated.interpolate(
      (translationX.value/ (translationY.value+0.0000001)),
      [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
      [0,             0,  0,    1, 0,    0, 0],
    );
    return {
      transform:[
        {
          scale: Reanimated.interpolate(translationYvsX,
            [-SCREEN_HEIGHT, -100, 0, 100, SCREEN_HEIGHT],
            [0.9, 0.9, 1, 0.9, 0.9],
          ),
        },
        {
          scaleX: viewScaleX.value,
        },
        {
          scaleY: viewScaleY.value,
        },
        {
          translateX: (
              (
                (
                  viewScaleX.value*SCREEN_WIDTH
                ) - 
                SCREEN_WIDTH
              )
              / (2*(viewScaleX.value+ 0.000001))
          ),
        },
        {
          translateY: (
            (
              (
                viewScaleY.value*(SCREEN_HEIGHT)
              ) - (SCREEN_HEIGHT)
            )
            / (2*(viewScaleY.value+ 0.000001))
          )+translationYvsX
        }
      ]
    }
  });
  const backdropAnimatedStyle = Reanimated.useAnimatedStyle(()=>{
    const translationYvsX = translationY.value*Reanimated.interpolate(
      (translationX.value/ (translationY.value+0.0000001)),
      [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
      [0,             0,  0,    1, 0,    0, 0],
    );
    return {
      opacity: props.modalShown.value*isModalOpen.value*Reanimated.interpolate(
        viewScaleX.value* Reanimated.interpolate(
          translationYvsX,
          [-100, 0, 100],
          [0, 1, 0],
        ),
        [0, 0.5, 1],
        [0, 0, 1],
      ),
    }
  });

  const _handleAddToAlbum = () => console.log('Adding');
  const _goBack = () => {
    console.log('Went back');
    props.modalShown.value = 0;
  }
  const _handleEdit = () => console.log('edit');

  return (
    <Reanimated.View 
      style={[{
        width:SCREEN_WIDTH, 
        height:SCREEN_HEIGHT,
        position:'absolute',
        top: 0,
        left: 0,
      }, mainAnimatedStyle]}
    >
      <Reanimated.View 
        style={[styles.ModalView, subAnimatedStyle, {
          width:SCREEN_WIDTH,
          height:SCREEN_HEIGHT,
          top: 0,
          left: 0,
        }]}
      >
        
      <Reanimated.View 
        style={[ recyclerAnimatedStyle, {
          position: 'relative',
          width:'100%',
          height:'100%',
          top: 0,
          left: 0,
        }]}
      >
        <LongPressGestureHandler
          onHandlerStateChange={_onLongTapHandlerStateChange}
          minDurationMs={800}
        >
          <Reanimated.View style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}>
            <PanGestureHandler
              enabled={true}
              maxPointers={1}
              ref={singleTapRef}
              simultaneousHandlers={[nativeViewRef]}
              onGestureEvent={_onPanGestureEvent}
            >
              <Reanimated.View style={{width: SCREEN_WIDTH, height: SCREEN_HEIGHT}}>
              <NativeViewGestureHandler
                ref={nativeViewRef}
                simultaneousHandlers={singleTapRef}
              >
                <RecyclerListView
                  ref={scrollRef}
                  externalScrollView={ExternalScrollView}
                  isHorizontal={true}
                  dataProvider={dataProvider}
                  layoutProvider={layoutProvider}
                  renderAheadOffset={1}
                  waitFor={[pinchRef]}
                  scrollViewProps={{
                    scrollRefExternal:scrollRefExternal,
                    disableIntervalMomentum: true,
                    disableScrollViewPanResponder: false,
                    horizontal: true,
                    pagingEnabled: true,
                    directionalLockEnabled: true,
                    scrollEnabled: true,
                  }}
                  style={{
                    width:SCREEN_WIDTH, 
                    height:SCREEN_HEIGHT,
                  }}
                  rowRenderer={(type:string | number, item:Asset, index: number) => (
                    <Media
                      imageHeight={calcImageDimension(item, SCREEN_HEIGHT, SCREEN_WIDTH).height}
                      imageWidth={calcImageDimension(item, SCREEN_HEIGHT, SCREEN_WIDTH).width}
                      media={item}
                      modalShown={isModalOpen}
                      index={index}
                      pinchRef={pinchRef}
                      imageScale={imageScale}
                      animatedSingleMediaIndex={props.animatedSingleMediaIndex}
                    />
                  )}
                />
              </NativeViewGestureHandler>
              </Reanimated.View>
            </PanGestureHandler>
          </Reanimated.View>
        </LongPressGestureHandler>
      </Reanimated.View>
      </Reanimated.View>
      <Reanimated.View style={[styles.backdrop, backdropAnimatedStyle, 
        {
          height:  SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
        }]}
      >

      </Reanimated.View>
      <Reanimated.View style={[{zIndex:15,width:SCREEN_WIDTH,height:30,position:'absolute',left:0, top:0}, topActionsAnimatedStyle]}>
      <SingleMediaTopActions
          actionBarOpacity={props.modalShown}
          leftActions={[
            {
              icon: "keyboard-backspace",
              onPress: _goBack,
              color: "white",
              name: "back",
            },
            
          ]}
          rightActions={[
            {
              icon: "image-edit-outline",
              onPress: _handleEdit,
              color: "white",
              name: "edit",
            },
            {
              icon: "plus",
              onPress: _handleAddToAlbum,
              color: "white",
              name: "add",
            },
            
          ]}
          moreActions={[]}
        />
        </Reanimated.View>
    </Reanimated.View>
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

export default SingleMedia;
