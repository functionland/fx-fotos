import {Button} from 'react-native';
import {PinchGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Photos from './Photos';

function Box() {
  return (
    <PinchGestureHandler>
      <Animated.View>
        <Photos />
      </Animated.View>
    </PinchGestureHandler>
  );
}
