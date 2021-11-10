import React, {createRef, useEffect, useRef} from 'react';
import {Dimensions} from 'react-native';
import {sortCondition} from '../../types/interfaces';
import {changeSortCondition} from '../../utils/functions';
import {PinchGestureHandler, PinchGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {useRecoilState} from 'recoil';
import {numColumnsState} from '../../states/photos';
import {
	default as Reanimated,
	useAnimatedGestureHandler,
	Easing,
	withTiming, runOnJS,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
	scale: Reanimated.SharedValue<number>;
	numColumnsAnimated: Reanimated.SharedValue<number>
}

const PinchZoom: React.FC<Props> = (props) => {
	const [numColumns, setNumColumns] = useRecoilState(numColumnsState);
	const _pinchOrZoom = useRef<'pinch' | 'zoom' | undefined>();
	const sortCondition = useRef<sortCondition>('day');

	useEffect(() => {
		console.log([Date.now() + ': component PinchZoom' + numColumns + ' rendered']);
	});
	let pinchRef = createRef<PinchGestureHandler>();

	const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
		onStart: (_, ctx) => {

		},
		onActive: (event, ctx) => {
			props.scale.value = event.scale;
		},
		onEnd: (event) => {
			if ((event.scale > 1.3 && props.numColumnsAnimated.value > 2) || (event.scale < 0.8 && props.numColumnsAnimated.value < 4)) {
				props.scale.value = withTiming(
					event.scale > 1 ? 4 : 0,
					{
						duration: 250,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						if (props.numColumnsAnimated.value === 2) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(3);
								props.numColumnsAnimated.value = 3;
								console.log('changing columns to 3');
								props.scale.value = 1;
							}
						} else if (props.numColumnsAnimated.value === 3) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(4);
								props.numColumnsAnimated.value = 4;
								props.scale.value = 1;
								console.log('changing columns to 4')
							} else {
								runOnJS(setNumColumns)(2);
								props.numColumnsAnimated.value = 2;
								props.scale.value = 1;
								console.log('changing columns to 2')
							}
						} else if (props.numColumnsAnimated.value === 4) {
							if (event.scale > 1) {
								runOnJS(setNumColumns)(3);
								props.numColumnsAnimated.value = 3;
								props.scale.value = 1;
								console.log('changing columns to 3')
							}
						}
					}
				)
			} else if (event.scale !== 1) {
				props.scale.value = withTiming(
					1,
					{
						duration: 50,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						props.scale.value = 1;
					}
				)
			}
		},
	});
	
	return (

		<PinchGestureHandler
			ref={pinchRef}
			onGestureEvent={_onPinchGestureEvent}
		>
			<Reanimated.View
				style={{
					width: SCREEN_WIDTH,
					height: SCREEN_HEIGHT,
					zIndex: 3,
				}}
			>
				{props.children}
			</Reanimated.View>
		</PinchGestureHandler>

	);
};

export default PinchZoom;
