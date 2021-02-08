import {View} from 'native-base';
import React, {Children, useMemo, useState} from 'react';
import {Animated, NativeTouchEvent, PanResponder} from 'react-native';
import {getDistance} from '../utils/functions';

interface Props {
  opacity: Animated.Value;
}

const PinchZoom: React.FC<Props> = (props) => {
  let initialXs: Array<number> = [];
  let initialYs: Array<number> = [];
  let currentXs: Array<number> = [];
  let currentYs: Array<number> = [];

  const resetAnimation = () => {
    Animated.spring(props.opacity, {
      toValue: props.opacity,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (event) => {
          let touches = event.nativeEvent.touches;

          if (touches.length == 2) {
            return true;
          } else {
            return false;
          }
        },
        onPanResponderStart: (initial_event, initial_gesture) => {
          let touches = initial_event.nativeEvent.touches;
          if (touches.length == 2) {
            initialXs = [];
            initialYs = [];
            initialXs.push(touches[0].locationX);
            initialXs.push(touches[1].locationX);
            initialYs.push(touches[0].locationY);
            initialYs.push(touches[1].locationY);
          }
        },
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
          let touches = event.nativeEvent.touches;
          if (touches.length == 2) {
            currentXs = [];
            currentYs = [];
            currentXs.push(touches[0].locationX);
            currentXs.push(touches[1].locationX);
            currentYs.push(touches[0].locationY);
            currentYs.push(touches[1].locationY);
          }
          console.log('Xs', initialXs, currentXs);
          console.log('Ys', initialYs, currentYs);
        },
        onPanResponderRelease: (event, gesture) => {
          let touches = event.nativeEvent.touches;
          console.log('Xs', initialXs, currentXs);
          console.log('Ys', initialYs, currentYs);
          if (touches.length == 2) {
            console.log('Xs', initialXs, currentXs);
            console.log('Ys', initialYs, currentYs);
          }
        },
      }),
    [],
  );
  return (
    <Animated.View {...panResponder.panHandlers}>
      {props.children}
    </Animated.View>
  );
};

export default PinchZoom;
