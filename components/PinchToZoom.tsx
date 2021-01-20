import {ReactChildren} from 'react';
import {Button} from 'react-native';
import {PinchGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Photos from './Photos';

interface Props {
  children: Element;
  sortCondition: 'day' | 'month' | 'week';
  setSortCondition: Function;
}

const PinchToZoom: React.FC<Props> = (props) => {
  return (
    <PinchGestureHandler
      onGestureEvent={() => console.log('sege')}
      onHandlerStateChange={() => console.log('soote')}>
      <Animated.View>{props.children}</Animated.View>
    </PinchGestureHandler>
  );
};

export default PinchToZoom;
