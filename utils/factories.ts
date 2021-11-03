import {Media} from "../domian";
import {headerIndex, story, layout, FlatSection} from "../types/interfaces";
import {timestampToDate} from "./functions";
import uuid from 'react-native-uuid';

export const flatListFactory = (medias: Media[],
							   sortConditions: Array<'day' | 'month'>,
							   lastTimestamp: number = 0,
							   lastIndex: number): FlatSection => {

	let layout: Array<layout> = [];
	let headerIndexes: Array<headerIndex> = [];
	let stories: story[] = [];
	let count = {'day': 0, 'month': 0};
	if (lastTimestamp === 0) {
		layout.push({value: 'story placeholder', sortCondition: '', index: -1, deleted: false, id: 'story' ,uid:uuid.v4() as string});
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
					id: (medias[i].modificationTime + '' + j),
					uid:uuid.v4() as string
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
					timestamp: medias[i].modificationTime,
					uid:uuid.v4() as string
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
			id: medias[i].id,
			uid:uuid.v4() as string
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
	return {lastTimestamp:lastMediaTimestamp,layout,headerIndexes,stories}
	
} 