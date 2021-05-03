import * as MediaLibrary from 'expo-media-library';

export interface reduxState {
  user: {
    name: string;
    email: string;
    token: string;
  };
  box: Array<MediaLibrary.Asset>;
  images: Array<sortedPhotos>;
  sortCondition: sortCondition;
  loading: boolean;
  photos: Array<MediaLibrary.Asset>;
  numColumns: 2 | 3 | 4;
  numberOfPhotos: number;
}

export interface sortedPhotos {
  [key: string]: Array<MediaLibrary.Asset>;
}

export interface reduxAction {
  type: string;
  payload: any;
}

export interface changeSortConditionAndNumColumns {
  (
    sortCondition_i: sortCondition,
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

export interface photoChunk {
  date: string;
  data: Array<Array<MediaLibrary.Asset>>;
}

export interface MediaItem {
  assets: Array<MediaLibrary.Asset>;
  endCursor: string;
  hasNextPage: boolean;
  totalCount: number;
}
