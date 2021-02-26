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
  numColumns: 2 | 3 | 4;
}

export interface sortedPhotos {
  [key: string]: Array<PhotoIdentifier>;
}

export interface reduxAction {
  type: string;
  payload: any;
}

export interface changeSortConditionAndNumColumns {
  (
    sortCondition: sortCondition,
    pinchOrZoom: 'pinch' | 'zoom',
    numCols: 2 | 3 | 4,
  ): {sortCondition: string; numColumns: number};
}

export interface sortDetails {
  sortCode: sortCondition;
  width: number;
  height: number;
}

export type sortCondition = 'day' | 'month';
