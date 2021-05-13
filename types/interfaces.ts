import {Asset} from 'expo-media-library';

export interface reduxState {
  user: {
    name: string;
    email: string;
    token: string;
  };
  box: Array<Asset>;
  images: Array<sortedPhotos>;
  sortCondition: sortCondition;
  loading: boolean;
  photos: Array<Asset>;
  numColumns: 2 | 3 | 4;
  numberOfPhotos: number;
}

export interface sortedPhotos {
  [key: string]: Array<Asset>;
}

export interface reduxAction {
  type: string;
  payload: any;
}

export interface changeSortConditionAndNumColumns {
  (
    sortCondition_i: sortCondition,
    pinchOrZoom: 'pinch' | 'zoom' | undefined,
    numCols: 2 | 3 | 4,
  ): {sortCondition: sortCondition; numColumns: 2 | 3 | 4};
}

export interface sortDetails {
  sortCode: sortCondition;
  width: number;
  height: number;
}

export type sortCondition = 'day' | 'month';

export interface photoChunk {
  date: {value:string;};
  data: Array<{value:Asset;}>;
}

export interface flatMedia {
  value:Asset|string;
}
export interface FlatSection {
  layout: layout[];
  headerIndexes:headerIndex[];
}

export interface MediaItem {
  assets: Array<Asset>;
  endCursor: string;
  hasNextPage: boolean;
  totalCount: number;
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

export interface layout {value:Asset|string; sortCondition:'day'|'month'|''};

export interface headerIndex {header:string;index:number;count:number;yearStart:string; sortCondition:'day'|'month'};