import CameraRoll, {PhotoIdentifier} from '@react-native-community/cameraroll';
import {NativeTouchEvent} from 'react-native';

export const sortPhotos = (photos: Array<PhotoIdentifier>) => {
  let timestamps = photos
    .map((photo) => photo.node.timestamp * 1000)
    .sort((a, b) => b - a);
  let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
  let result: any = {day: {}, month: {}, week: {}};

  for (let timestamp of timestamps_str) {
    result.day[timestampToDate(+timestamp, 'day')] = [];
    result.month[timestampToDate(+timestamp, 'month')] = [];
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

export const getDistance = (touches: Array<NativeTouchEvent>) => {
  const [a, b] = touches;

  if (a == null || b == null) {
    return 0;
  }
  return Math.sqrt(
    pow2abs(a.locationX, b.locationX) + pow2abs(a.locationY, b.locationY),
  );
};
