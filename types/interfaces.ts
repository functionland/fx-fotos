import {Asset} from 'expo-media-library';
import { SectionListData } from 'react-native';

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

export interface album {
	name: string;
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

export interface story {
  medias: Asset[],
  text: string,
};
export interface FlatSection {
  layout: layout[];
  headerIndexes:headerIndex[];
  stories:story[];
  lastTimestamp:number;
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

export interface BottomSheetElement {
	name: string;
	icon: string;
	key: string;
	action: any;
}

export interface layout {value:Asset|string; sortCondition:'day'|'month'|''|'deleted', index: number, deleted:boolean, id:string};

export interface headerIndex {header:string;index:number;count:number;yearStart:string; sortCondition:'day'|'month'; timestamp: number;};

export interface geoData {
	latitude: string;
	longitude: string;
	altitude: string;
	latitudeSpan: string;
	longitudeSpan: string;
}

export interface uploadedFrom {
	url: string;
	localFolderName: string;
	deviceType: string;
}

export interface metadata {
	name: string;
	caption: string;
	createdAt: number;
	photoTakenTime: number;
	lastModifiedAt: number;
	geoData: geoData;
	geoDataExif: geoData;
	people: [string];
	uploadedFrom: uploadedFrom;
	viewCount: number;
};