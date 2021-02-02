import {View} from 'native-base';
import React, {useState} from 'react';
import {
  PanResponder,
  Animated,
  NativeTouchEvent,
  SafeAreaView,
} from 'react-native';
import {sortCondition} from '../types/interfaces';

const sortConditionChange = (
  sortCondition: sortCondition,
  pinchAndZoom: 'pinch' | 'zoom' | undefined,
) => {
  if (sortCondition && pinchAndZoom) {
    if (sortCondition == 'day' && pinchAndZoom == 'zoom') return 'day';
    else if (sortCondition == 'day' && pinchAndZoom == 'pinch') return 'montxh';
    // else if (sortCondition == 'week' && pinchAndZoom == 'zoom') return 'day';
    // else if (sortCondition == 'week' && pinchAndZoom == 'pinch') return 'month';
    else if (sortCondition == 'month' && pinchAndZoom == 'zoom') return 'day';
    else if (sortCondition == 'month' && pinchAndZoom == 'pinch')
      return 'month';
  }
};

const pow2abs = (a: number, b: number) => {
  return Math.pow(Math.abs(a - b), 2);
};

const getDistance = (touches: Array<NativeTouchEvent>) => {
  const [a, b] = touches;

  if (a == null || b == null) {
    return 0;
  }
  return Math.sqrt(
    pow2abs(a.locationX, b.locationX) + pow2abs(a.locationY, b.locationY),
  );
};

const opacityChange = (
  opacityValue: any,
  toValue: number
) => {
  Animated.timing(opacityValue, {
    toValue,
    duration: 400,
    useNativeDriver: false,
  }).start();
};

const resetAnimation = (animation: any, toValue: number) => {
  Animated.timing(animation, {
    toValue,
    duration: 400,
    useNativeDriver: false,
  }).start();
};

interface Props {
  children: Element;
  fromValue: number;
  toValue: number;
}

const PinchAndZoom: React.FC<Props> = (props) => {
  const viewOpacity = new Animated.Value(props.fromValue);
  let initialTouch: Array<NativeTouchEvent> = [];
  let currentTouch: Array<NativeTouchEvent> = [];
  let pinchAndZoom: 'pinch' | 'zoom' | undefined = undefined;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (event, gesture) => {
      let touches = event.nativeEvent.touches.length;
      if (touches == 1) {
        return false;
      } else {
        return true;
      }
    },
    onPanResponderStart: (initial_event, initial_gesture) => {
      let touches = initial_event.nativeEvent.touches;

      if (touches.length == 2) {
        initialTouch = touches;
      }
    },
    onPanResponderMove: (event, gesture) => {
      let touches = event.nativeEvent.touches;

      if (touches.length == 2) {
        currentTouch = touches;
        let initialDistance = getDistance(initialTouch);
        let currentDistance = getDistance(currentTouch);
        if (initialDistance < currentDistance) {
          pinchAndZoom = 'zoom';
          opacityChange(viewOpacity, props.toValue);
          
        } else if (initialDistance > currentDistance) {
          pinchAndZoom = 'pinch';
          opacityChange(viewOpacity, props.toValue);
        }
      }

      if (touches.length == 1) {
      }
    },
    onPanResponderRelease: (event, gesture) => {
      let initialDistance = getDistance(initialTouch);
      let currentDistance = getDistance(currentTouch);
      if (currentDistance - initialDistance < 2) {
        resetAnimation(viewOpacity, props.fromValue);
      }
    },
  });

  return (
    <View>
      <Animated.View
        style={{
          opacity: viewOpacity,
          width: viewOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['200%', '100%'],
          }),
        }}
        {...panResponder.panHandlers}>
        {props.children}
      </Animated.View>
    </View>
  );
};
export default PinchAndZoom;
