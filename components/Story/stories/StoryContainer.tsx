import React, { useState, useRef, useEffect } from "react"
import ProgressView from "./ProgressView"
import StoryView from "./StoryView"
import { StoryContainerProps } from "../utils/interfaceHelper"
import { StyleSheet, View, SafeAreaView, Platform, Keyboard, Animated, KeyboardAvoidingView, useWindowDimensions } from "react-native"
import { GREEN, LIGHT_GRAY_0, RED, TINT_GRAY, GRAY } from "../utils/colors"
import ReplyFooterView from "./ReplyFooterView"
import UserHeaderView from "./UserHeaderView"
import {DEFAULT_DURATION} from '../utils/constant' ;
import {
  TapGestureHandler,
  PanGestureHandler,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import { ScaleFromCenterAndroid } from "@react-navigation/stack/lib/typescript/src/TransitionConfigs/TransitionPresets"

const StoryContainer = (props: StoryContainerProps) => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {isMounted.current = false;}
  }, []);

  const [progressIndex, setProgressIndex] = useState<number>(0)
  const [stopProgress, setStopProgress] = useState<boolean>(false);
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const translationX = new Animated.Value(0);
  const translationY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const translationYvsX = Animated.multiply(translationY, Animated.divide(translationX, Animated.add(translationY,0.0000001)).interpolate({
    inputRange: [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
    outputRange: [0,             0,  0,    1, 0,    0, 0],
  }))

  useEffect(() => {
    if(isMounted){
      // Alert.prompt("Called")
      setProgressIndex(progressIndex);
    }
  }, [props.enableProgress])

  useEffect(()=>{
    setProgressIndex(0);
  },[props.visible])

  useEffect(() => {
    let listener1 = Keyboard.addListener('keyboardDidShow', onShowKeyboard);
    let listener2 = Keyboard.addListener('keyboardDidHide', onHideKeyboard);

    return () => {
      listener1.remove();
      listener2.remove();
    };
  }, []);

  const close = (direction:number = 1) => {
    Animated.parallel([
      Animated.timing(translationY, {
        toValue: direction*SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(()=>{
      if(isMounted){
        props.onComplete();
      }
    },300);
  }

  function onShowKeyboard(e: any) {
    if(isMounted){
      console.log(stopProgress);
      setStopProgress(true);
    }
  }

  function onHideKeyboard(e: any) {
    if(isMounted){
      console.log(stopProgress);
      setStopProgress(false);
    }
  }

  function onArrowClick(type: string) {
    if(isMounted){
      Keyboard.dismiss();
      switch (type) {
        case 'left':
          onChange((progressIndex === 0 )? progressIndex : (progressIndex - 1))
          break

        case 'right':
          const size = props.imageStyle ? props.images.length - 1 : 0
          onChange((progressIndex === size) ? progressIndex : (progressIndex + 1))
          break
      }
    }
  }

  function onChange(position: number) {
    if(isMounted){
      if ((props.enableProgress != undefined ? props.enableProgress : true) && !stopProgress) {
        if (position < props.images.length) {
          setProgressIndex(position)
        } else {
          close(1);
        }
      }
    }
  }

  const _onTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if(isMounted){
      if(event.nativeEvent.state === State.BEGAN){
        //start Pause
        console.log('setStopProgress true');
        setStopProgress(true);
      }else if (event.nativeEvent.state === State.END){
        console.log('setStopProgress false');
        setStopProgress(false);
        if(event.nativeEvent.absoluteX < SCREEN_WIDTH/2){
          //go to prev slide
          onArrowClick('left');
        }else{
          //go to next slide
          onArrowClick('right');
        }
      }
    }
  }

  const _onPanHandlerStateChange = ( event:HandlerStateChangeEvent<PanGestureHandlerEventPayload> ) => {
    if(isMounted){
      if (event.nativeEvent.state === State.END){
        //End pause
        console.log('setStopProgress false');
        setStopProgress(false);
        if((event.nativeEvent.translationY/event.nativeEvent.translationX > 0.6 || event.nativeEvent.translationY/event.nativeEvent.translationX < -0.6) && Math.abs(event.nativeEvent.translationY)>50 ){
          if(event.nativeEvent.translationY>0){
            close(1);
          }else{
            close(-1);
          }
        }
      }
    }
  }

  const _onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translationX, translationY: translationY, } }],
    { useNativeDriver: true }
  );

  return (
    <SafeAreaView>
      {
        Platform.OS === 'ios' && (
          <KeyboardAvoidingView behavior='padding' >
            <View>
              {props.visible ? getView() : <View></View>}
            </View>
          </KeyboardAvoidingView>
        )
      }

      {
        Platform.OS === 'android' && (
          <View>
            {props.visible ? getView() : <View></View>}
          </View>
        )
      }
    </SafeAreaView>
  )

  function getView() {
    return (
    <TapGestureHandler
      onHandlerStateChange={_onTapHandlerStateChange}
    >
      <Animated.View 
        style={[
          props.containerStyle ? props.containerStyle : styles.parentView,
          {
            opacity: opacity,
            transform: [
              {
                translateY: translationYvsX
              },
              {
                scale: scale,
              }
            ]
          }
        ]}
      >
        <PanGestureHandler
          onHandlerStateChange={_onPanHandlerStateChange}
          onGestureEvent={_onPanGestureEvent}
        >
        <Animated.View 
          style={[props.containerStyle ? props.containerStyle : styles.parentView,]}
        >
          <StoryView
            images={props.images}
            duration={props.duration ? props.duration : DEFAULT_DURATION}
            progressIndex={progressIndex}
            imageStyle={props.imageStyle}
            id={props.id+"_StoryView"}
          />

          <View style={[styles.customView, {width: SCREEN_WIDTH}]}>
            <View style={[styles.topView, {width: SCREEN_WIDTH}]}>

              {
                props.userProfile && (
                  <UserHeaderView
                    userImage={props.userProfile?.userImage}
                    userName={props.userProfile?.userName}
                    userMessage={props.userProfile?.userMessage}
                    imageArrow={props.userProfile?.imageArrow}
                    onImageClick={() => props.userProfile?.onImageClick && props.userProfile?.onImageClick()} />
                )
              }
              {
                !props.userProfile && (
                  props.headerComponent
                )
              }

            </View>

            <View style={styles.bottomView}>
              {
                props.replyView?.isShowReply && !props.footerComponent && (
                  <ReplyFooterView
                    progressIndex={progressIndex}
                    onReplyTextChange={props.replyView?.onReplyTextChange}
                    onReplyButtonClick={props.replyView?.onReplyButtonClick} />
                )
              }
              {
                !props.replyView?.isShowReply && props.footerComponent && (
                  <View style={styles.bottomView}>
                    {props.footerComponent}
                  </View>
                )
              }
            </View>
          </View>

          <View style={[styles.progressView, {width: SCREEN_WIDTH}]}>
            <ProgressView
              enableProgress={(props.enableProgress != undefined ? props.enableProgress : true) && !stopProgress}
              images={props.images}
              duration={props.duration ? props.duration : DEFAULT_DURATION}
              barStyle={props.barStyle}
              progressIndex={progressIndex}
              onChange={(position: number) => onChange(position)}
              id={props.id+'_ProgressView'}
            />
          </View>
        </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
    );
  }
}

export default StoryContainer;

const styles = StyleSheet.create({
  parentView: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: TINT_GRAY,
    // marginTop: Platform.OS === 'ios' ? -40 : 0
  },
  customView: {
    position: 'absolute',
    flexDirection: 'column',
    height: '100%',
  },
  topView: {
    position: 'absolute',
    flexDirection: 'column',
    paddingTop: '3%',  
  },
  bottomView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'baseline',
    textAlignVertical: 'bottom',
    paddingTop: '3%',
    paddingBottom: '2%',
    // backgroundColor: TINT_GRAY,
  },
  progressView: {
    flex: 1,
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: TINT_GRAY,
  },
});