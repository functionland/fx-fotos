import React, {createContext, createRef, useEffect, useRef} from 'react';
import {useWindowDimensions} from 'react-native';
import {PinchGestureHandler, PinchGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {useRecoilState} from 'recoil';
import {numColumnsState} from '../../states/photos';
import {
	default as Reanimated,
	useAnimatedGestureHandler,
	Easing,
	withTiming, runOnJS, useSharedValue,
} from 'react-native-reanimated';
import {ColumnState} from "./SharedState";

export const ScaleContext = createContext<Reanimated.SharedValue<number>|null>(null)

interface Props {
}

const PinchZoom: React.FC<Props> = (props) => {
	const [numColumns, setNumColumns] = useRecoilState(ColumnState);
	const numColumnsAnimated = useSharedValue(numColumns)
	const {height, width} = useWindowDimensions();
	const scale = useSharedValue(1)

	useEffect(() => {
		console.log([Date.now() + ': component PinchZoom' + numColumns + ' rendered']);
	});
	let pinchRef = createRef<PinchGestureHandler>();

	const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
		onStart: (_, ctx) => {

		},
		onActive: (event, ctx) => {
			scale.value = event.scale;
		},
		onEnd: (event) => {
			if ((event.scale > 1.3 && numColumnsAnimated.value > 2) || (event.scale < 0.8 && numColumnsAnimated.value < 4)) {
				scale.value = withTiming(
					event.scale > 1 ? 4 : 0,
					{
						duration: 250,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						if (numColumnsAnimated.value === 2) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(3);
								numColumnsAnimated.value = 3;
								console.log('changing columns to 3');
								scale.value = 1;
							}
						} else if (numColumnsAnimated.value === 3) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(4);
								numColumnsAnimated.value = 4;
								scale.value = 1;
								console.log('changing columns to 4')
							} else {
								runOnJS(setNumColumns)(2);
								numColumnsAnimated.value = 2;
								scale.value = 1;
								console.log('changing columns to 2')
							}
						} else if (numColumnsAnimated.value === 4) {
							if (event.scale > 1) {
								runOnJS(setNumColumns)(3);
								numColumnsAnimated.value = 3;
								scale.value = 1;
								console.log('changing columns to 3')
							}
						}
					}
				)
			} else if (event.scale !== 1) {
				scale.value = withTiming(
					1,
					{
						duration: 50,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						scale.value = 1;
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
					zIndex: 3,
				}}>
				<ScaleContext.Provider value={scale}>
					{props.children}
				</ScaleContext.Provider>
			</Reanimated.View>
		</PinchGestureHandler>

	);
};

export default PinchZoom;
