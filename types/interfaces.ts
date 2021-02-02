import {PhotoIdentifier} from '@react-native-community/cameraroll';

export interface reduxState {
  user: {
    name: string;
    email: string;
    token: string;
  };
  box: Array<PhotoIdentifier>;
  images: Array<sortedPhotos>;
  sortCondition: sortCondition;
}

export interface sortedPhotos {
  photos: Array<PhotoIdentifier>;
  title: string;
  sizes: number;
}

export interface reduxAction {
  type: string;
  payload: any;
}

export interface sortedPhotosObject {
  day: {[key: string]: Array<PhotoIdentifier>};
  week: {[key: string]: Array<PhotoIdentifier>};
  month: {[key: string]: Array<PhotoIdentifier>};
}

export type sortCondition = 'day' | 'month' | 'week';
