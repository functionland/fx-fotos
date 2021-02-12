import React, {useState} from 'react';
import {Animated, Dimensions, PanResponder} from 'react-native';
import {getDistance} from '../utils/functions';

const WINDOW_WIDTH = Dimensions.get('screen').width;
const WINDOW_HEIGHT = Dimensions.get('screen').height;

interface Props {
  distance: Animated.Value;
}

const PinchZoom: React.FC<Props> = (props) => {
  let initialXs: Array<number> = [];
  let initialYs: Array<number> = [];
  let currentXs: Array<number> = [];
  let currentYs: Array<number> = [];
  let zIndex: number = 0;
  let initial_distance: number = 0;
  let current_distance: number = 0;

  const panResponder = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: (event, gesture) => {
        let touches = event.nativeEvent.touches;
        if (gesture.numberActiveTouches == 2) {
          zIndex = 2;
          return true;
        } else {
          zIndex = 0;
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
      onPanResponderGrant: () => {
        initialXs = initialXs;
        initialYs = initialYs;
        currentXs = currentXs;
        currentYs = currentYs;
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
        let animationProgress = 0;
        props.distance.stopAnimation((event) => (animationProgress = event));
        if (Math.sqrt(Math.pow(animationProgress, 2)) < 200) {
          Animated.timing(props.distance, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  )[0];
  return (
    <Animated.View
      style={{
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        zIndex: zIndex,
      }}
      {...panResponder.panHandlers}>
      {props.children}
    </Animated.View>
  );
};

export default PinchZoom;
