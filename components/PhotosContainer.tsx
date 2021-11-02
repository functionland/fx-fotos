import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, useWindowDimensions, Platform, UIManager, LayoutAnimation} from 'react-native';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {useRecoilState, useRecoilTransaction_UNSTABLE} from 'recoil';
import {mediasState} from '../states';
import {default as Reanimated,} from 'react-native-reanimated';
import {headerIndexesState, lastTimestampState, layoutState, storiesState} from "../states/photos";
import {Media} from "../domian";
import {flatListFactory} from "../utils/factories";


interface Props {
	scrollY2: Reanimated.SharedValue<number>;
	scrollY3: Reanimated.SharedValue<number>;
	scrollY4: Reanimated.SharedValue<number>;
	scale: Reanimated.SharedValue<number>;
	numColumnsAnimated: Reanimated.SharedValue<number>;
	HEADER_HEIGHT: number;
	FOOTER_HEIGHT: number;
	headerShown: Reanimated.SharedValue<number>;
}

if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PhotosContainer: React.FC<Props> = (props) => {
	const SCREEN_WIDTH = useWindowDimensions().width;
	const SCREEN_HEIGHT = useWindowDimensions().height;
	const [medias] = useRecoilState(mediasState)
	const storiesHeight: number = 1.618 * SCREEN_WIDTH / 3;
	const [permission, setPermission] = useState<boolean>();
	const loading = useRef<boolean>(false);
	const focalX = useRef(new Animated.Value(0)).current;
	const focalY = useRef(new Animated.Value(0)).current;
	const numberOfPointers = useRef(new Animated.Value(0)).current;
	const velocity = useRef(new Animated.Value(0)).current;
	const loadGallery = useRecoilTransaction_UNSTABLE(({get, set}) =>
		(medias: Media[],
		 sortConditions: Array<'day' | 'month'>,
		 lastTimestampInput: number = 0,
		 lastIndex: number) => {
			const {lastTimestamp,layout,headerIndexes,stories}=flatListFactory(medias,sortConditions,lastTimestampInput,lastIndex)
			set(lastTimestampState, lastTimestamp)
			set(layoutState, layout)
			set(headerIndexesState, headerIndexes)
			set(storiesState, stories)
		})

	useEffect(() => {
		console.log("whay u dont render")
		if (medias?.length) {
			loadGallery(medias, ['day', 'month'], 0, 0)
		}
	}, [medias]);
	
	// TODO add refresh transaction
	useEffect(() => {

	}, [permission]);

	useEffect(() => {
		console.log([Date.now() + ': component PhotosContainer rendered']);
	});

	useEffect(() => {
		console.log(['component PhotosContainer mounted']);
		storagePermission()
			.then((res) => setPermission(res))
			.catch((error) => {
			});
		return () => {
			console.log(['component PhotosContainer unmounted']);
		}
	}, []);
	
	
	
	const removeElements = (elementIndex: string[]) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
	}

	return medias.length ? (
		<View
			style={{
				flex: 1,
				flexDirection: 'column',
				width: SCREEN_WIDTH,
				position: 'relative',
				zIndex: 10,
			}}
		>
			<PinchZoom
				scale={props.scale}
				numColumnsAnimated={props.numColumnsAnimated}
				focalX={focalX}
				focalY={focalY}
				numberOfPointers={numberOfPointers}
				velocity={velocity}
			>
				<AllPhotos
					removeElements={removeElements}
					scale={props.scale}
					numColumnsAnimated={props.numColumnsAnimated}
					scrollY2={props.scrollY2}
					scrollY3={props.scrollY3}
					scrollY4={props.scrollY4}
					loading={loading.current}
					focalX={focalX}
					focalY={focalY}
					numberOfPointers={numberOfPointers}
					velocity={velocity}
					storiesHeight={storiesHeight}
					HEADER_HEIGHT={props.HEADER_HEIGHT}
					FOOTER_HEIGHT={props.FOOTER_HEIGHT}
					headerShown={props.headerShown}
					SCREEN_HEIGHT={SCREEN_HEIGHT}
					SCREEN_WIDTH={SCREEN_WIDTH}
				/>
			</PinchZoom>
		</View>
	) : (
		<></>
	);
};
const isEqual = (prevProps: Props, nextProps: Props) => {
	return (prevProps.HEADER_HEIGHT === nextProps.HEADER_HEIGHT);
}
export default PhotosContainer;
