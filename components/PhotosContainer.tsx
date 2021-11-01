import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, useWindowDimensions, Platform, UIManager, LayoutAnimation} from 'react-native';
import {storagePermission} from '../utils/permissions';
import AllPhotos from './AllPhotos';
import PinchZoom from './PinchZoom';
import {useRecoilState, useRecoilTransaction_UNSTABLE} from 'recoil';
import {mediasState} from '../states';
import {default as Reanimated,} from 'react-native-reanimated';
import {headerIndexesState, lastTimestampState, layoutState, storiesState} from "../states/gallery";
import {Media} from "../domian";
import {headerIndex, story, layout} from "../types/interfaces";
import {timestampToDate} from "../utils/functions";


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
		 lastTimestamp: number = 0,
		 lastIndex: number) => {

			let layout: Array<layout> = [];
			let headerIndexes: Array<headerIndex> = [];
			let stories: story[] = [];
			let count = {'day': 0, 'month': 0};
			if (lastTimestamp === 0) {
				layout.push({value: 'story placeholder', sortCondition: '', index: -1, deleted: false, id: 'story'});
			}

			let lastTimestampObj = timestampToDate(
				lastTimestamp,
				[...sortConditions, 'year'],
			);

			let lastYear = {'day': (lastTimestampObj.year || ''), 'month': (lastTimestampObj.year || '')};

			let counter1: { [key: number]: number } = {};
			let counter2: { [key: number]: number } = {};
			let counter3: { [key: number]: number } = {};
			let highlightedMedia: { [key: string]: boolean } = {};

			for (let i = 0; i < medias.length; i++) {
				let yearStart = {'day': '', 'month': ''};
				let mediaTimestampObj = timestampToDate(
					medias[i].modificationTime,
					[...sortConditions, 'year'],
				);

				let mediaTimestampYear = mediaTimestampObj.year;

				//Creating stories
				let now = new Date();
				now.setHours(0, 0, 0, 0);

				let media = new Date(medias[i].modificationTime);
				media.setHours(0, 0, 0, 0);

				//Current photos in the same year
				if ((now.getDate() === media.getDate()) && now.getFullYear() === media.getFullYear()) {
					if (!counter1[media.getMonth()]) {
						counter1[media.getMonth()] = 0;
					}
					counter1[media.getMonth()] = counter1[media.getMonth()] + 1;
					if (!stories[0] || !stories[0].medias) {
						stories[0] = {medias: [], text: 'Recent'};
					}
					if (counter1[media.getMonth()] <= 2 && !highlightedMedia[medias[i].id]) {
						stories[0].medias.push(medias[i]);
						highlightedMedia[medias[i].id] = true;
					}
				}

				//Current photos in the past years
				if (now.getDate() === media.getDate() && now.getMonth() === media.getMonth() && now.getFullYear() !== media.getFullYear()) {
					let difference = now.getFullYear() - media.getFullYear();
					if (!counter2[difference]) {
						counter2[difference] = 0;
					}
					counter2[difference] = counter2[difference] + 1;

					if (!stories[difference] || !stories[difference].medias) {
						stories[difference] = {
							medias: [],
							text: difference + ' ' + (difference === 1 ? 'year' : 'years') + ' ago'
						};
					}
					if (counter2[difference] <= 6 && !highlightedMedia[medias[i].id]) {
						stories[difference].medias.push(medias[i]);
						highlightedMedia[medias[i].id] = true;
					}
				}

				//Current photos in the past months-->This is temporary for demo
				if (now.getDate() === media.getDate() && now.getMonth() !== media.getMonth() && now.getFullYear() === media.getFullYear()) {
					let difference = now.getMonth() - media.getMonth();
					if (difference < 0) {
						difference = 12 + difference;
					}
					if (!counter3[difference]) {
						counter3[difference] = 0;
					}
					counter3[difference] = counter3[difference] + 1;

					if (!stories[difference] || !stories[difference].medias) {
						stories[difference] = {
							medias: [],
							text: difference + ' ' + (difference === 1 ? 'month' : 'months') + ' ago'
						};
					}
					if (counter3[difference] <= 6 && !highlightedMedia[medias[i].id]) {
						stories[difference].medias.push(medias[i]);
						highlightedMedia[medias[i].id] = true;
					}
				}

				//End of creating stories

				//Creating media and headerIndex
				for (let j = 0; j < sortConditions.length; j++) {
					let sortCondition_j = sortConditions[j];
					if (mediaTimestampObj[sortCondition_j] !== lastTimestampObj[sortCondition_j] || lastYear[sortCondition_j] !== mediaTimestampYear) {
						lastTimestampObj[sortCondition_j] = mediaTimestampObj[sortCondition_j];

						layout.push({
							value: mediaTimestampObj[sortCondition_j],
							sortCondition: sortCondition_j,
							index: -1,
							deleted: false,
							id: (medias[i].modificationTime + '' + j)
						});

						let headerIndexLength = headerIndexes.length;
						let lastHeaderIndex = [...headerIndexes].reverse().findIndex(headerIndex => headerIndex.sortCondition === sortCondition_j);
						if (lastHeaderIndex > -1) {
							headerIndexes[headerIndexLength - 1 - lastHeaderIndex].count = count[sortCondition_j];
						}
						if (mediaTimestampYear !== lastYear[sortCondition_j]) {
							lastYear[sortCondition_j] = mediaTimestampObj.year;
							yearStart[sortCondition_j] = lastYear[sortCondition_j];
						}
						headerIndexes.push({
							header: mediaTimestampObj[sortCondition_j],
							index: layout.length - 1 + lastIndex,
							count: 0,
							yearStart: yearStart[sortCondition_j],
							sortCondition: sortCondition_j,
							timestamp: medias[i].modificationTime
						});
						count[sortCondition_j] = 0;
					}
					count[sortCondition_j] = count[sortCondition_j] + 1;
				}

				layout.push({
					value: medias[i],
					sortCondition: '',
					index: i + lastIndex,
					deleted: false,
					id: medias[i].id
				});

			}


			let lastHeaderIndex = {'day': -1, 'month': -1};
			let headerIndexLength = headerIndexes.length;
			for (let j = 0; j < sortConditions.length; j++) {
				let sortCondition_j = sortConditions[j];
				lastHeaderIndex[sortCondition_j] = [...headerIndexes].reverse().findIndex(headerIndex => headerIndex.sortCondition === sortCondition_j);
				if (lastHeaderIndex[sortCondition_j] > -1) {
					headerIndexes[headerIndexLength - 1 - lastHeaderIndex[sortCondition_j]].count = count[sortCondition_j];
				}
			}

			stories = stories.filter(x => x?.medias[0]?.uri);
			let lastMediaTimestamp = 0;
			if (medias && medias.length) {
				lastMediaTimestamp = medias[medias.length - 1].modificationTime;
			}
			set(lastTimestampState, lastMediaTimestamp)
			set(layoutState, layout)
			set(headerIndexesState, headerIndexes)
			set(storiesState, stories)
		})


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


	useEffect(() => {
		if (medias?.length) {
			loadGallery(medias, ['day', 'month'], 0, medias.length)
		}
	}, [medias]);
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
export default React.memo(PhotosContainer, isEqual);
