import * as MediaLibrary from 'expo-media-library';
import {
	changeSortConditionAndNumColumns,
	sortCondition,
} from '../types/interfaces';

export const timestampToDate = (
	timestamp: number,
	conditions: Array<('day' | 'month') | 'year'>,
) => {
	let date = new Date(timestamp);
	let month = date.getUTCMonth(); //months from 1-12
	let day = date.getUTCDate();
	let year = date.getUTCFullYear();
	let result: { [key: string]: string } = {};
	for (let i = 0; i < conditions.length; i++) {
		if (conditions[i] === 'day') {
			result.day = new Date(year, month, day).toString().split(year.toString())[0];
		} else if (conditions[i] === 'month') {
			const monthNames = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
			result.month = monthNames[new Date(year, month).getMonth()];
		} else if (conditions[i] === 'year') {
			result.year = String(year);
		}
	}
	return result;
};


export const prettyTime = (seconds: number) => {
	const format = (val: number) => {

		return `0${Math.floor(val)}`.slice(-2);
	}
	const hours = seconds / 3600;
	const minutes = (seconds % 3600) / 60;
	if (hours > 1) {
		return [hours, minutes, seconds % 60].map(format).join(':');
	} else if (minutes > 1) {
		return [minutes, seconds % 60].map(format).join(':');
	} else {
		return '0:' + [seconds % 60].map(format).join(':');
	}
}

export const changeSortCondition: changeSortConditionAndNumColumns = (
	sortCondition_i: sortCondition,
	pinchOrZoom: 'pinch' | 'zoom' | undefined,
	numCols: 2 | 3 | 4,
) => {
	let result: { sortCondition: sortCondition, numColumns: 2 | 3 | 4 } = {
		sortCondition: 'day',
		numColumns: 2,
	};

	if (pinchOrZoom === 'pinch') {
		if (sortCondition_i === 'day') {
			if (numCols === 2) {
				result = {...result, sortCondition: 'day', numColumns: 2};
			} else if (numCols === 3) {
				result = {...result, sortCondition: 'day', numColumns: 2};
			}
		} else if (sortCondition_i === 'month') {
			result = {...result, sortCondition: 'day', numColumns: 3};
		}
	}

	if (pinchOrZoom === 'zoom') {
		if (sortCondition_i === 'day') {
			if (numCols === 2) {
				result = {...result, sortCondition: 'day', numColumns: 3};
			} else if (numCols === 3) {
				result = {...result, sortCondition: 'month', numColumns: 4};
			}
		} else if (sortCondition_i === 'month') {
			result = {...result, sortCondition: 'month', numColumns: 4};
		}
	}

	return result;
};

export const calcImageDimension = (media: MediaLibrary.Asset | undefined, SCREEN_HEIGHT: number, SCREEN_WIDTH: number) => {
	let imageWidth_t = SCREEN_WIDTH;
	let imageHeight_t = SCREEN_HEIGHT;
	if (media) {
		if (media.height > SCREEN_HEIGHT && media.width > SCREEN_WIDTH) {
			if (media.height / media.width > SCREEN_HEIGHT / SCREEN_WIDTH) {
				imageWidth_t = media.width * SCREEN_HEIGHT / (media.height == 0 ? 1 : media.height);
			} else {
				imageHeight_t = SCREEN_WIDTH * media.height / (media.width == 0 ? 1 : media.width);
			}
		} else if (media.height > SCREEN_HEIGHT) {
			imageWidth_t = media.width * SCREEN_HEIGHT / (media.height == 0 ? 1 : media.height);
		} else if (media.width > SCREEN_WIDTH) {
			imageHeight_t = SCREEN_WIDTH * media.height / (media.width == 0 ? 1 : media.width);
		} else if (media.height <= SCREEN_HEIGHT && media.width <= SCREEN_WIDTH) {
			imageHeight_t = media.height;
			imageWidth_t = media.width;
		}
	}
	return {height: imageHeight_t, width: imageWidth_t}
};

export const saveImage = async (result: any) => {
	const asset = await MediaLibrary.createAssetAsync(result.uri);
	return asset;
}