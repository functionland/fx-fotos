import React, {useState, createRef} from 'react';
import {Animated, Dimensions} from 'react-native';
import {sortCondition} from '../types/interfaces';
import {
  changeSortCondition,
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
  baseScale: Animated.AnimatedAddition;
  baseScale2: Animated.Value;
  setPinchOrZoom: Function;
  pinchOrZoom:'pinch'|'zoom'|undefined;
  setSortCondition: Function;
  setNumColumns: Function;
  numColumns: 2 | 3 | 4;
  sortCondition: sortCondition;
}

let _pinchOrZoom: 'pinch'|'zoom'|undefined = undefined;
const PinchZoom: React.FC<Props> = (props) => {
  let pinchRef = createRef();
  const [allowAnimation, setAllowAnimation] = useState<boolean>(true);
  let _onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: props.scale } }],
    { useNativeDriver: true }
  );
  let _onPinchHandlerStateChange = (event:GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      animationTransition(event);
    }
  };

  const animationTransition = (
    event:GestureEvent<PinchGestureHandlerEventPayload>
  ) => {
    if(event.nativeEvent.scale > 1){
      _pinchOrZoom = 'pinch';
    }else if(event.nativeEvent.scale < 1){
      _pinchOrZoom = 'zoom';
    }else{
      _pinchOrZoom = undefined;
    }

      console.log('animation end cycle');
      if((event.nativeEvent.scale > 1.3 && props.numColumns>2) || (event.nativeEvent.scale < 0.8 && props.numColumns<4)){
        let finalVal:number = 0;
        let _sortCondition = changeSortCondition(
          props.sortCondition,
          _pinchOrZoom,
          props.numColumns,
        );
        if(event.nativeEvent.scale > 1){
          finalVal = 4;
        }else if(event.nativeEvent.scale < 1){
          finalVal = 0;
        }
        console.log(props.baseScale);
        console.log(props.scale);
        setAllowAnimation(false);
        Animated.timing(props.scale, {
          toValue: finalVal,
          duration: 250,
          useNativeDriver: true
        }).start(() => {
          console.log('forward animation ended');
          
          props.setSortCondition(_sortCondition.sortCondition);
          props.setNumColumns(_sortCondition.numColumns);
          props.setPinchOrZoom(undefined);
          props.scale.setValue(1);
          if(_sortCondition.numColumns===2){
            props.baseScale2.setValue(0);
          }else if(_sortCondition.numColumns===3){
            props.baseScale2.setValue(1);
          }else if(_sortCondition.numColumns===4){
            props.baseScale2.setValue(2);
          }

          console.log(props.baseScale2);
          console.log(props.baseScale);
          console.log(props.scale);
          console.log(finalVal);
          setAllowAnimation(true);
        });
      }else{
        console.log("here"+event.nativeEvent.state);
        Animated.timing(props.scale, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true
        }).start(() => {
          console.log('revert animation ended');
          props.scale.setValue(1);
          props.setPinchOrZoom(undefined);
          setAllowAnimation(true);
        });
      }
  };

  return (
    <PinchGestureHandler
    ref={pinchRef}
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
