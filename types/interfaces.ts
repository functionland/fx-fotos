import {Asset} from 'expo-media-library';
import {Media} from "../domian";


export interface album {
	name: string;
}

export interface changeSortConditionAndNumColumns {
	(
		sortCondition_i: sortCondition,
		pinchOrZoom: 'pinch' | 'zoom' | undefined,
		numCols: 2 | 3 | 4,
	): { sortCondition: sortCondition; numColumns: 2 | 3 | 4 };
}

export type sortCondition = 'day' | 'month';

export interface flatMedia {
	value: Asset | string;
}

export interface story {
	medias: Media[],
	text: string,
};

export interface FlatSection {
	layout: layout[];
	headerIndexes: headerIndex[];
	stories: story[];
	lastTimestamp: number;
}

export interface ScrollEvent {
	nativeEvent: {
		contentOffset: {
			x: number,
			y: number,
		},
		layoutMeasurement?: Dimension,
		contentSize?: Dimension,
	};
}

export interface Dimension {
	height: number;
	width: number;
}

export interface BottomSheetElement {
	name: string;
	icon: string;
	key: string;
	action: any;
}

export interface layout {
	value: Media | string;
	sortCondition: 'day' | 'month' | '' | 'deleted',
	index: number,
	deleted: boolean,
	id: string
	uid : string
};

export interface headerIndex {
	header: string;
	index: number;
	count: number;
	yearStart: string;
	sortCondition: 'day' | 'month';
	timestamp: number;
	uid : string
};


// new one's

export declare type Column = 2 | 3 | 4

export enum SectionType {
	Day = "DAY",
	Month = 'MONTH',
	Year = 'YEAR'
}

export interface SectionHeader {
	timeStamp: Date
}

export enum ItemType {
	Photo,
	Video,
	Stories,
	SectionHeader,
	SectionHeaderBig,
	SectionHeaderMedium
}

export interface Data {
	id: string
	value: story[] | Media | SectionHeader,
	type: ItemType
}
