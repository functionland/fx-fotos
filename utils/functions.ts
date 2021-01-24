import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {sortedPhotosObject} from '../types/interfaces';

export const sortPhotos = (photos: Array<PhotoIdentifier>) => {
  let timestamps = photos
    .map((photo) => photo.node.timestamp * 1000)
    .sort((a, b) => b - a);
  let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
  let result: any = {day: {}, month: {}, week: {}};

  for (let timestamp of timestamps_str) {
    result.day[timestampToDate(+timestamp, 'day')] = [];
    result.month[timestampToDate(+timestamp, 'month')] = [];
    result.month[timestampToDate(+timestamp, 'week')] = [];
  }

  for (let photo of photos) {
    result['day'][timestampToDate(photo.node.timestamp * 1000, 'day')].push(
      photo,
    );
    result['month'][timestampToDate(photo.node.timestamp * 1000, 'month')].push(
      photo,
    );
  }

  return result;
};

// export const splitDate = (date: string) => {
//   let
// }

export const timestampToDate = (
  timestamp: number,
  condition: 'day' | 'month' | 'week',
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
