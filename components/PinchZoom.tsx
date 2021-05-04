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
  setAnimationDone: Function;
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
  let _onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: props.scale } }],
    { useNativeDriver: true }
  );

  
  let _onPinchHandlerStateChange = (event:GestureEvent<PinchGestureHandlerEventPayload>) => {
    _pinchOrZoom = ((event.nativeEvent.scale > 1)?'pinch':'zoom');
    props.setAnimationDone(false);
    if (event.nativeEvent.oldState === State.ACTIVE) {
      console.log(event.nativeEvent.scale);
      animationTransition(event);
    }
  };

  const animationTransition = (
    event:GestureEvent<PinchGestureHandlerEventPayload>
  ) => {
    let _sortCondition = changeSortCondition(
      props.sortCondition,
      _pinchOrZoom,
      props.numColumns,
    );
    props.setSortCondition(_sortCondition.sortCondition);
    props.setNumColumns(_sortCondition.numColumns);
    props.setPinchOrZoom(_pinchOrZoom);
    props.scale.setValue(1);
    props.setAnimationDone(true);
  };
/*
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event, gesture) => {
        let touches = event.nativeEvent.touches;
        if (gesture.numberActiveTouches == 2) {
          //zIndex = 2;
          return true;
        } else {
         // zIndex = 0;
          return false;
        }
      },
      onPanResponderStart: (initial_event, initial_gesture) => {
        let touches = initial_event.nativeEvent.touches;

        initialXs = [];
        initialYs = [];

        initialXs.push(touches[0].locationX);
        initialXs.push(touches[1].locationX);
        initialYs.push(touches[0].locationY);
        initialYs.push(touches[1].locationY);
      },
      onPanResponderMove: (event, gesture) => {
        let touches = event.nativeEvent.touches;

        if (touches.length == 2) {
          currentXs = [];
          currentYs = [];

          currentXs.push(touches[0].locationX);
          currentXs.push(touches[1].locationX);
          currentYs.push(touches[0].locationY);
          currentYs.push(touches[1].locationY);

          initial_distance = getDistance(
            initialXs[0],
            initialYs[0],
            initialXs[1],
            initialYs[1],
          );
          current_distance = getDistance(
            currentXs[0],
            currentYs[0],
            currentXs[1],
            currentYs[1],
          );
        }

        props.distance.setValue(initial_distance - current_distance);
      },
      onPanResponderRelease: () => {
        zIndex = 0;
        let animationProgress = (props.distance as any)._value;
        if (Math.abs(animationProgress) < SCREEN_WIDTH * 0.1) {
          Animated.timing(props.distance, {
            toValue: -SCREEN_WIDTH * 0.8,
            duration: 250,
            useNativeDriver: false,
          }).start();
        } else if (animationProgress < -(SCREEN_WIDTH * 0.1)) {
          Animated.spring(props.distance, {
            toValue: -SCREEN_WIDTH * 0.8,
            useNativeDriver: false,
          }).start((event) => {
            animationTransition(event, 'zoom');
            props.setPinchOrZoom('zoom');
          });
        } else if (animationProgress > SCREEN_WIDTH * 0.1) {
          Animated.spring(props.distance, {
            toValue: SCREEN_WIDTH * 0.8,
            useNativeDriver: false,
          }).start((event) => {
            animationTransition(event, 'pinch');
            props.setPinchOrZoom('pinch');
          });
        }
      },
    }),
  ).current;*/

  return (
    <PinchGestureHandler
                ref={pinchRef}
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
