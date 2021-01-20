import {PhotoIdentifier} from '@react-native-community/cameraroll';

export const sortPhotos = (
  photos: Array<PhotoIdentifier>,
  condition: 'week' | 'day' | 'month',
) => {
  let timestamps = photos
    .map((photo) => photo.node.timestamp * 1000)
    .sort((a, b) => b - a);
  let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
  let result: any = {};

  if (condition == 'day') {
    for (let timestamp of timestamps_str) {
      result[timestampToDate(+timestamp, 'day')] = [];
    }

    for (let photo of photos) {
      result[timestampToDate(photo.node.timestamp * 1000, 'day')].push(photo);
      //   result[new Date(photo.node.timestamp).toString()] = res;
    }
  } else if (condition == 'month') {
    for (let timestamp of timestamps_str) {
      result[timestampToDate(+timestamp, 'month')] = [];
    }

    for (let photo of photos) {
      result[timestampToDate(photo.node.timestamp * 1000, 'month')].push(photo);
      //   result[new Date(photo.node.timestamp).toString()] = res;
    }
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
