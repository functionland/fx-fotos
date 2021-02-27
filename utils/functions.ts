import CameraRoll, {PhotoIdentifier} from '@react-native-community/cameraroll';
import {NativeTouchEvent} from 'react-native';
import {
  changeSortConditionAndNumColumns,
  sortCondition,
} from '../types/interfaces';

// export const sortPhotos = (photos: Array<PhotoIdentifier>) => {
//   let timestamps = photos
//     .map((photo) => photo.node.timestamp * 1000)
//     .sort((a, b) => b - a);
//   let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
//   let result: any = {largeDay: {}, month: {}, smallDay: {}};

//   for (let timestamp of timestamps_str) {
//     result.largeDay[timestampToDate(+timestamp, 'day')] = [];
//     result.smallDay[timestampToDate(+timestamp, 'day')] = [];
//     result.month[timestampToDate(+timestamp, 'month')] = [];
//   }

//   for (let photo of photos) {
//     result['smallDay'][
//       timestampToDate(photo.node.timestamp * 1000, 'day')
//     ].push(photo);
//     result['largeDay'][
//       timestampToDate(photo.node.timestamp * 1000, 'day')
//     ].push(photo);
//     result['month'][timestampToDate(photo.node.timestamp * 1000, 'month')].push(
//       photo,
//     );
//   }

//   return result;
// };

export const sortPhotos = (
  photos: Array<PhotoIdentifier>,
  sortCondition: 'day' | 'month',
) => {
  let result: any = {};
  let timestamps = photos
    .map((photo) => photo.node.timestamp * 1000)
    .sort((a, b) => b - a);
  let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
  if (sortCondition == 'day') {
    for (let TS of timestamps_str) {
      result[timestampToDate(+TS, 'day')] = [];
    }
    for (let photo of photos) {
      result[timestampToDate(photo.node.timestamp * 1000, 'day')].push(photo);
    }

    return result;
  } else if (sortCondition == 'month') {
    for (let TS of timestamps_str) {
      result[timestampToDate(+TS, 'month')] = [];
    }
    for (let photo of photos) {
      result[timestampToDate(photo.node.timestamp * 1000, 'month')].push(photo);
    }

    return result;
  }

  return result;
};

// export const splitDate = (date: string) => {
//   let
// }

export const timestampToDate = (
  timestamp: number,
  condition: 'day' | 'month',
) => {
  let date = new Date(timestamp);
  let month = date.getUTCMonth() + 1; //months from 1-12
  let day = date.getUTCDate();
  let year = date.getUTCFullYear();
  let result;

  if (condition == 'day') {
    result = new Date(year, month, day).toString().split(year.toString())[0];
  } else if (condition == 'month') {
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
    result = monthNames[new Date(year, month).getMonth()];
  }
  if (result) {
    return result;
  } else {
    return 'unknown';
  }
};

export const getStoragePhotos = (per: boolean, numberOfPhotos: number) => {
  if (per) {
    return new Promise((resolve, reject) =>
      CameraRoll.getPhotos({
        first: numberOfPhotos,
        assetType: 'All',
      })
        .then((res) => resolve(res))
        .catch((err) => reject(err)),
    );
  }
};

export const pow2abs = (a: number, b: number) => {
  return Math.pow(Math.abs(a - b), 2);
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  return distance;
};

export const findDiameter = (width: number, height: number) => {
  let pow2 = Math.pow(width, 2) + Math.pow(height, 2);

  return Math.sqrt(pow2);
};

export const changeSortCondition: changeSortConditionAndNumColumns = (
  sortCondition,
  pinchOrZoom,
  numCols,
) => {
  let result = {
    sortCondition: 'day',
    numColumns: 2,
  };

  if (pinchOrZoom === 'zoom') {
    if (sortCondition === 'day') {
      if (numCols === 2) {
        console.log('A');
        result = {...result, sortCondition: 'day', numColumns: 2};
      } else if (numCols === 3) {
        console.log('B');
        result = {...result, sortCondition: 'day', numColumns: 2};
      }
    } else if (sortCondition === 'month') {
      console.log('C');
      result = {...result, sortCondition: 'day', numColumns: 3};
    }
  }

  if (pinchOrZoom === 'pinch') {
    if (sortCondition === 'day') {
      if (numCols === 2) {
        console.log('D');
        result = {...result, sortCondition: 'day', numColumns: 3};
      } else if (numCols === 3) {
        console.log('E');
        result = {...result, sortCondition: 'month', numColumns: 4};
      }
    } else if (sortCondition === 'month') {
      console.log('F');
      result = {...result, sortCondition: 'month', numColumns: 4};
    }
  }

  return result;
};

export const opacityTransition = (
  sortCondition: sortCondition,
  numColumns: 2 | 3 | 4,
  thisComponentSeperator: 'day' | 'month',
  thisComponentNumCol: 2 | 3 | 4,
) => {
  if (
    thisComponentSeperator == sortCondition &&
    thisComponentNumCol == numColumns
  )
    return [1, 0];
  else return [0, 1];
};
