import React, {createRef, useState} from 'react';
import {Animated, Dimensions} from 'react-native';
import {sortCondition} from '../types/interfaces';
import {changeSortCondition} from '../utils/functions';
import {
  HandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  scale: Animated.Value;
  baseScale: Animated.AnimatedAddition;
  baseScale2: Animated.Value;
  setPinchOrZoom: Function;
  pinchOrZoom: 'pinch' | 'zoom' | undefined;
  setSortCondition: Function;
  setNumColumns: Function;
  numColumns: 2 | 3 | 4;
  sortCondition: sortCondition;
  focalX: Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  velocity: Animated.Value;
  setIsPinchAndZoom: Function;
  isPinchAndZoom: boolean;
}

let _pinchOrZoom: 'pinch' | 'zoom' | undefined;
const PinchZoom: React.FC<Props> = (props) => {
  let pinchRef = createRef<PinchGestureHandler>();
  const [allowAnimation, setAllowAnimation] = useState<boolean>(true);
  let _onPinchGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          scale: props.scale,
          focalX: props.focalX,
          focalY: props.focalY,
          numberOfPointers: props.numberOfPointers,
          velocity: props.velocity,
        },
      },
    ],
    {useNativeDriver: true},
  );
  let _onPinchHandlerStateChange = (
    event: HandlerStateChangeEvent<PinchGestureHandlerEventPayload>,
  ) => {
    if (
      event.nativeEvent.oldState === State.ACTIVE &&
      event.nativeEvent.state !== State.ACTIVE
    ) {
      let scale: number = event.nativeEvent.scale;
      if (
        (scale > 1.3 && props.numColumns > 2) ||
        (scale < 0.8 && props.numColumns < 4)
      ) {
        setAllowAnimation(false);
        Animated.timing(props.scale, {
          toValue: scale > 1 ? 4 : 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          animationTransition(scale);
        });
      } else if (scale !== 1) {
        Animated.timing(props.scale, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }).start(() => {
          console.log('revert animation ended');
          props.scale.setValue(1);
          props.setPinchOrZoom(undefined);
          setAllowAnimation(true);
        });
      }
    }
    /*if(event.nativeEvent.numberOfPointers > 1 && !props.isPinchAndZoom){
      props.setIsPinchAndZoom(true);
    }else if(props.isPinchAndZoom && event.nativeEvent.numberOfPointers == 1){
      props.setIsPinchAndZoom(false);
    }*/
  };

  const animationTransition = (scale: number) => {
    if (scale > 1) {
      _pinchOrZoom = 'pinch';
    } else if (scale < 1) {
      _pinchOrZoom = 'zoom';
    } else {
      _pinchOrZoom = undefined;
    }

    console.log('animation end cycle');

    let _sortCondition = changeSortCondition(
      props.sortCondition,
      _pinchOrZoom,
      props.numColumns,
    );

    props.setSortCondition(_sortCondition.sortCondition);
    props.setNumColumns(_sortCondition.numColumns);
    props.setPinchOrZoom(undefined);
    props.scale.setValue(1);
    if (_sortCondition.numColumns === 2) {
      props.baseScale2.setValue(0);
    } else if (_sortCondition.numColumns === 3) {
      props.baseScale2.setValue(1);
    } else if (_sortCondition.numColumns === 4) {
      props.baseScale2.setValue(2);
    }
    setAllowAnimation(true);
    props.setIsPinchAndZoom(false);
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
        }}>
        {props.children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default PinchZoom;
