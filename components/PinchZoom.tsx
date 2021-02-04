import {View} from 'native-base';
import React, {Children, useState} from 'react';
import {Animated, NativeTouchEvent, PanResponder} from 'react-native';
import {getDistance} from '../utils/functions';

interface Props {
  opacity: Animated.Value;
}

const PinchZoom: React.FC<Props> = (props) => {
  let initialTouch: Array<NativeTouchEvent> = [];
  let [currentDistance, setCurrentDistance] = useState<number>(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderStart: (initial_event) => {
      let touches = initial_event.nativeEvent.touches;
      if (touches.length == 2) {
        initialTouch = touches;
      }
    },
    onPanResponderMove: (event, gesture) => {
      let touches = event.nativeEvent.touches;
      console.log(event);
      if (touches.length == 2) {
        let initialDistance = getDistance(initialTouch);
        let currentDistance = getDistance(touches);
        if (initialDistance < currentDistance) {
          Animated.timing(props.opacity, {
            toValue: 1,
            useNativeDriver: false,
            duration: 200,
          }).start(() => {
            console.log('END OF PINCH');
          });
        } else if (initialDistance > currentDistance) {
          Animated.timing(props.opacity, {
            toValue: 0,
            useNativeDriver: false,
            duration: 200,
          }).start(() => {
            console.log('END OF ZOOM');
          });
        }
      }
    },
  });

  return (
    <Animated.View {...panResponder.panHandlers}>
      {props.children}
    </Animated.View>
  );
};

export default PinchZoom;
