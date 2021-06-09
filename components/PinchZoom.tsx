import React, {useState, createRef, useEffect, useRef} from 'react';
import {Animated, Dimensions,View} from 'react-native';
import {sortCondition} from '../types/interfaces';
import {
  changeSortCondition,
} from '../utils/functions';
import {
  PinchGestureHandler,
  State,
  PinchGestureHandlerEventPayload,
  HandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import {
  useRecoilState,
} from 'recoil';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  scale: Animated.Value;
  baseScale: Animated.AnimatedAddition;
  baseScale2: Animated.Value;
  setNumColumns: Function;
  numColumns: 2 | 3 | 4;
  focalX: Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  velocity: Animated.Value;
}

const PinchZoom: React.FC<Props> = (props) => {
  const _pinchOrZoom = useRef<'pinch' | 'zoom' | undefined>();
  const sortCondition = useRef<sortCondition>('day');

  useEffect(()=>{
    console.log([Date.now()+': component PinchZoom'+props.numColumns+' rendered']);
  });
  let pinchRef = createRef<PinchGestureHandler>();
  
  let _onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: props.scale, focalX:props.focalX, focalY:props.focalY, numberOfPointers:props.numberOfPointers, velocity:props.velocity } }],
    { useNativeDriver: true }
  );
  let _onPinchHandlerStateChange = (event:HandlerStateChangeEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      let scale:number = event.nativeEvent.scale;
      if((scale > 1.3 && props.numColumns>2) || (scale < 0.8 && props.numColumns<4)){
        Animated.timing(props.scale, {
          toValue: scale>1?4:0,
          duration: 250,
          useNativeDriver: true
        }).start(() => {
          animationTransition(scale);
        });

      }else if(scale !== 1){
        Animated.timing(props.scale, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true
        }).start(() => {
          ////('revert animation ended');
          props.scale.setValue(1);
        });
      }
    }
  };

  const animationTransition = (
    scale:number
  ) => {
    if(scale > 1){
      _pinchOrZoom.current = 'pinch';
    }else if(scale < 1){
      _pinchOrZoom.current = 'zoom';
    }else{
      _pinchOrZoom.current = undefined;
    }

      ////console.log('animation end cycle');
      
        let _sortCondition = changeSortCondition(
          sortCondition.current,
          _pinchOrZoom.current,
          props.numColumns,
        );
          
        sortCondition.current = _sortCondition.sortCondition;
          props.setNumColumns(_sortCondition.numColumns);
          props.scale.setValue(1);
          if(_sortCondition.numColumns===2){
            props.baseScale2.setValue(0);
          }else if(_sortCondition.numColumns===3){
            props.baseScale2.setValue(1);
          }else if(_sortCondition.numColumns===4){
            props.baseScale2.setValue(2);
          }
  };

  return (

    <PinchGestureHandler
    ref={pinchRef}
    onGestureEvent={_onPinchGestureEvent}
    onHandlerStateChange={_onPinchHandlerStateChange}
    >
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
