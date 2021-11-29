import React, {createRef, useEffect} from 'react';
import {PinchGestureHandler, PinchGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {useRecoilState} from 'recoil';
import {
	default as Reanimated,
	useAnimatedGestureHandler,
	Easing,
	withTiming, runOnJS, useSharedValue, useAnimatedStyle, interpolate,
} from 'react-native-reanimated';
import {ColumnState} from "../SharedState";
import {StatusBar, StyleSheet, useWindowDimensions} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

interface Props {

}

const PinchZoom: React.FC<Props> = (props) => {
	const insets = useSafeAreaInsets();
	const {width,height} = useWindowDimensions()
	const [numColumns, setNumColumns] = useRecoilState(ColumnState);
	const col = useSharedValue(numColumns)
	const scale = useSharedValue(1);

	useEffect(() => {
		console.log([Date.now() + ': component PinchZoom' + numColumns + ' rendered']);
	});
	let pinchRef = createRef<PinchGestureHandler>();

	const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
		onStart: (_, ctx) => {
			// return{height:height}
		},
		onActive: (event, ctx) => {
			scale.value = event.scale;
			// return{height:height}
		},
		onEnd: (event) => {
			if ((event.scale > 1.3 && col.value > 2) || (event.scale < 0.8 && col.value < 4)) {
				scale.value = withTiming(
					event.scale > 1 ? 4 : 0,
					{
						duration: 250,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						if (col.value === 2) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(3);
								col.value = 3;
								console.log('changing columns to 3');
								scale.value = 1;
							}
						} else if (col.value === 3) {
							if (event.scale < 1) {
								runOnJS(setNumColumns)(4);
								col.value = 4;
								scale.value = 1;
								console.log('changing columns to 4')
							} else {
								runOnJS(setNumColumns)(2);
								col.value = 2;
								scale.value = 1;
								console.log('changing columns to 2')
							}
						} else if (col.value === 4) {
							if (event.scale > 1) {
								runOnJS(setNumColumns)(3);
								col.value = 3;
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
						easing: Easing.bezier(0.1, 0.1, 0.1, 0.1),
					},
					() => {
						scale.value = 1;
					}
				)
			}
		},
	});

	const animatedStyle = useAnimatedStyle(() => {
		const _scale = interpolate(
			scale.value,
			[0, 1, 4],
			[col.value / (col.value + 1), 1, (col.value) / (col.value - 1)]
		);
		return {
			opacity: (interpolate(
				scale.value,
				[0, 1, 4],
				[0, 1, 0]
			)),
			zIndex: 99999,
			transform: [
				{
					scale: _scale,
				},
				{
					translateX: (((_scale * width) - width) / (2 * _scale))
				},
				{
					translateY: (
						(
							(_scale * (width - (StatusBar.currentHeight || 0))) - (width - (StatusBar.currentHeight || 0))
						)
						/ (2 * _scale))
				}
			],
		};

	});
	

	const baseStyle = () => {
		return {
			...styles.listContainer,
			width:width,
			height:height-insets.bottom
		}
	}
	
	
	return (
		<PinchGestureHandler
			ref={pinchRef}
			onGestureEvent={_onPinchGestureEvent}>
			<Reanimated.View style={[animatedStyle, baseStyle()]}>
				{props.children}
			</Reanimated.View>	
		</PinchGestureHandler>
	);
};

const styles = StyleSheet.create({
	listContainer: {
		flex:1,
	}
})

export default PinchZoom;
