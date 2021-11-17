import React, {createRef, useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import {PinchGestureHandler, PinchGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {useRecoilState} from 'recoil';
import {
	default as Reanimated,
	useAnimatedGestureHandler,
	Easing,
	withTiming, runOnJS, useSharedValue,
} from 'react-native-reanimated';
import {ColumnState} from "../SharedState";

interface Props {
	animatedCol: Reanimated.SharedValue<number>
	animatedScale: Reanimated.SharedValue<number>
}

const PinchZoom: React.FC<Props> = (props) => {
	const [numColumns, setNumColumns] = useRecoilState(ColumnState);
	const {height, width} = useWindowDimensions();

	useEffect(() => {
		console.log([Date.now() + ': component PinchZoom' + numColumns + ' rendered']);
	});
	let pinchRef = createRef<PinchGestureHandler>();

	const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
		onStart: (_, ctx) => {

		},
		onActive: (event, ctx) => {
			props.animatedScale.value = event.scale;
		},
		onEnd: (event) => {
			if ((event.scale > 1.3 && props.animatedCol.value > 2) || (event.scale < 0.8 && props.animatedCol.value < 4)) {
				props.animatedScale.value = withTiming(
					event.scale > 1 ? 4 : 0,
					{
						duration: 250,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						if (props.animatedCol.value === 2) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(3);
								props.animatedCol.value = 3;
								console.log('changing columns to 3');
								props.animatedScale.value = 1;
							}
						} else if (props.animatedCol.value === 3) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(4);
								props.animatedCol.value = 4;
								props.animatedScale.value = 1;
								console.log('changing columns to 4')
							} else {
								runOnJS(setNumColumns)(2);
								props.animatedCol.value = 2;
								props.animatedScale.value = 1;
								console.log('changing columns to 2')
							}
						} else if (props.animatedCol.value === 4) {
							if (event.scale > 1) {
								runOnJS(setNumColumns)(3);
								props.animatedCol.value = 3;
								props.animatedScale.value = 1;
								console.log('changing columns to 3')
							}
						}
					}
				)
			} else if (event.scale !== 1) {
				props.animatedScale.value = withTiming(
					1,
					{
						duration: 50,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						props.animatedScale.value = 1;
					}
				)
			}
		},
	});

	return (

		<PinchGestureHandler
			ref={pinchRef}
			onGestureEvent={_onPinchGestureEvent}>
			<Reanimated.View
				style={{
					width,
					height,
				}}>
				{props.children}
			</Reanimated.View>
		</PinchGestureHandler>

	);
};

export default PinchZoom;
