import React from "react";
import PinchZoom from "./Shared/PinchZoom";
import VerticalList from "./List/VerticalList";
import {
	default as Reanimated, interpolate, useAnimatedStyle, useSharedValue
} from 'react-native-reanimated';
import {StatusBar, StyleSheet, useWindowDimensions} from "react-native";
import {DefaultCol, FOOTER_HEIGHT} from "./Constants";
import ActionBar from "./Shared/ActionBar";


interface Props {

}

const Photos: React.FC<Props> = (props) => {
	const numColumnsAnimated = useSharedValue(DefaultCol)
	const {width, height} = useWindowDimensions()
	const scale = useSharedValue(1);
	const animatedStyle = useAnimatedStyle(() => {
		const _scale = interpolate(
			scale.value,
			[0, 1, 4],
			[numColumnsAnimated.value / (numColumnsAnimated.value + 1), 1, (numColumnsAnimated.value) / (numColumnsAnimated.value - 1)]
		);
		return {
			opacity: (interpolate(
				scale.value,
				[0, 1, 4],
				[0, 1, 0]
			)),
			zIndex: 1,
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
			width,
			maxHeight:height-FOOTER_HEIGHT-65,
		}
	}
	return (
		<>
			<ActionBar
				actions={[
					{
						icon: "download-lock-outline",
						onPress: ()=>{},
						color: "#007AFF",
						name: "download"
					}
				]}
				moreActions={[]}
			/>
			<PinchZoom animatedScale={scale} animatedCol={numColumnsAnimated}>
				<Reanimated.View
					style={[animatedStyle, baseStyle()]}
				>
					<VerticalList/>
				</Reanimated.View>
			</PinchZoom>

		</>

	)
}

const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
		position: 'relative',
	}
})

export default Photos;

