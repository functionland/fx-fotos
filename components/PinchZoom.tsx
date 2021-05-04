import React, {useEffect, useRef, useState, createRef} from 'react';
import {Animated, Dimensions, PanResponder} from 'react-native';
import {reduxState, sortCondition} from '../types/interfaces';
import {Constant} from '../utils/constants';
import {
  changeSortCondition,
  findDiameter,
  getDistance,
} from '../utils/functions';
import {
  PinchGestureHandler,
  State,
  PinchGestureHandlerEventPayload,
  GestureEvent,
} from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  scale: Animated.Value;
  setPinchOrZoom: Function;
  pinchOrZoom:'pinch'|'zoom'|undefined;
  setSortCondition: Function;
  setNumColumns: Function;
  numColumns: 2 | 3 | 4;
  sortCondition: sortCondition;
}

let _pinchOrZoom: 'pinch'|'zoom'|undefined = undefined;
const PinchZoom: React.FC<Props> = (props) => {
  const [allowAnimation, setAllowAnimation] = useState<boolean>(true);
  let _onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: props.scale } }],
    { useNativeDriver: true }
  );

  let _onPinchHandlerStateChange = (event:GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      //console.log('should not call this a lot1');
      //console.log(event.nativeEvent);
      animationTransition(event);
    }else if (event.nativeEvent.state === State.ACTIVE) {
      //console.log('should not call this a lot2');
      //console.log(event.nativeEvent);
      if(event.nativeEvent.scale > 1){
        _pinchOrZoom = 'pinch';
      }else if(event.nativeEvent.scale < 1){
        _pinchOrZoom = 'zoom';
      }else{
        _pinchOrZoom = undefined;
      }
      props.setPinchOrZoom(_pinchOrZoom);
    }
  };

  const animationTransition = (
    event:GestureEvent<PinchGestureHandlerEventPayload>
  ) => {
    if(event.nativeEvent.state !== State.ACTIVE){
      console.log('animation end cycle');
      if((event.nativeEvent.scale > 1.3 && props.numColumns>2) || (event.nativeEvent.scale < 0.8 && props.numColumns<4)){
        let finalVal:number = 0;
        let _sortCondition = changeSortCondition(
          props.sortCondition,
          _pinchOrZoom,
          props.numColumns,
        );
        if(event.nativeEvent.scale > 1){
          finalVal = 3;
        }else if(event.nativeEvent.scale < 1){
          finalVal = 0;
        }
        setAllowAnimation(false);
        Animated.timing(props.scale, {
          toValue: finalVal,
          duration: 250,
          useNativeDriver: true
        }).start(() => {
          console.log('animation ended');
          props.setSortCondition(_sortCondition.sortCondition);
          props.setNumColumns(_sortCondition.numColumns);
          props.setPinchOrZoom(undefined);
          props.scale.setValue(1);
          setAllowAnimation(true);
        });
      }else{
        console.log("here"+event.nativeEvent.state);
        props.setPinchOrZoom(undefined);
        props.scale.setValue(1);
      }
    }
  };

  return (
    <PinchGestureHandler
    enabled={allowAnimation}
    onGestureEvent={_onPinchGestureEvent}
    onHandlerStateChange={_onPinchHandlerStateChange}>
      <Animated.View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          zIndex: 3,
        }}
      >
        {props.children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default PinchZoom;
