import React, {useContext, useEffect} from "react";
import PinchZoom, {ScaleContext} from "./Shared/PinchZoom";
import VerticalList from "./List/VerticalList";
import {
	default as Reanimated, interpolate, useAnimatedStyle, useSharedValue
} from 'react-native-reanimated';
import {StatusBar, StyleSheet, useWindowDimensions} from "react-native";
import {useRecoilValue} from "recoil";
import {ColumnState} from "./SharedState";
import {FOOTER_HEIGHT} from "./Constants";
import ActionBar from "./Shared/ActionBar";


interface Props {

}

const PhotosContainer: React.FC<Props> = (props) => {
	
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
			<PinchZoom>
				<Photos></Photos>
			</PinchZoom>
		</>

	)
}

function Photos() {
	const col = useRecoilValue(ColumnState)
	const numColumnsAnimated = useSharedValue(col)
	const {width, height} = useWindowDimensions()
	const scale = useContext(ScaleContext);
	const animatedStyle = useAnimatedStyle(() => {
		if(!scale){
			return {
			}
		}
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
		<Reanimated.View
			style={[animatedStyle, baseStyle()]}
		>
			<VerticalList/>
		</Reanimated.View>
	)
}

const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
		position: 'relative',

	}
})

export default PhotosContainer;

