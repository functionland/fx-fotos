import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  ScrollView,
} from 'react-native-gesture-handler';
import React from 'react';

const pinchAndZoomHandler = (event: PinchGestureHandlerGestureEvent) => {
  return event.nativeEvent.scale;
};

interface Props {
  children: Element;
  setPinchScale: Function;
}

const PinchToZoom: React.FC<Props> = (props) => {
  return (
    <PinchGestureHandler
      onGestureEvent={(event) =>
        props.setPinchScale(pinchAndZoomHandler(event))
      }>
      <ScrollView>{props.children}</ScrollView>
    </PinchGestureHandler>
  );
};

export default PinchToZoom;
