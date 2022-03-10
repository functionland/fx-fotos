import React, { createRef, memo, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import {
    PinchGestureHandler,
    PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Reanimated, {
    useAnimatedGestureHandler,
    Easing,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { useRecoilState } from 'recoil';
import { numColumnsState } from '../../store'
import { useScale, useColumnsNumber, usePinching } from './GridContext'
import { sortCondition } from '../types/interfaces';



interface Props {
}

const PinchZoom: React.FC<Props> = (props) => {
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const sortCondition = useRef<sortCondition>('day');
    const scale = useScale();
    const pinching = usePinching();
    const [, setNumColumnsState] = useRecoilState(numColumnsState);
    const [numColumns, setColumns] = useColumnsNumber();

    useEffect(() => {
        console.log([Date.now() + ': component PinchZoom' + numColumns.value + ' rendered']);
    }, []);
    const updateColumn = (newValue: number) => {

        //setNumColumnsState(newValue);

    }

    const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
        onStart: (_, ctx) => {
            //console.log("Start pinching")
            pinching.value = false;
        },
        onActive: (event, ctx) => {
            let result = numColumns.value + 1 - event.scale; // linear scale, not geometric, we revert to 0 as the origin
            if (result <= 2) result = 2;
            else if (result >= 4) result = 4;
            else {
                pinching.value = true;
                scale.value = result;
            }
        },
        onEnd: (event) => {
            // scale.value = Math.round(scale.value);
            // pinching.value = false;
            // runOnJS(updateColumn)(scale.value)
            scale.value = withTiming(
                Math.round(scale.value),
                {
                    duration: 500,
                    //easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                },
                () => {
                    numColumns.value = scale.value;
                    // switching to the correct number of columns when the animation ends
                    pinching.value=false;
                    runOnJS(updateColumn)(scale.value)
                    // we reset the scale as we have modified the columns
                    // let _pinchOrZoom: "pinch" | "zoom" | undefined;
                    // if (event.scale > 1) {
                    //   _pinchOrZoom = 'pinch';
                    // } else if (event.scale < 1) {
                    //   _pinchOrZoom = 'zoom';
                    // }
                    // let endValue = Math.round(numColumns.value);
                    // if (endValue > 4) endValue = 4;
                    // else if (endValue < 2) endValue = 2;
                    // let _sortCondition = changeSortCondition(
                    //   sortCondition.current,
                    //   _pinchOrZoom,
                    //   endValue as 2 | 3 | 4,
                    // );

                    // sortCondition.current = _sortCondition.sortCondition;
                }
            );
        }
    }, []);

    return (
        <PinchGestureHandler
            onGestureEvent={_onPinchGestureEvent}>
            <Reanimated.View
                style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                    zIndex: 3,
                }}>
                {props.children}
            </Reanimated.View>
        </PinchGestureHandler>
    );
};

export default memo(PinchZoom, () => true);
