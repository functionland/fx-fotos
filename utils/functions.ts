import {Asset, MediaType, AssetsOptions, SortBy, getAssetsAsync} from 'expo-media-library';
import {
  changeSortConditionAndNumColumns,
  photoChunk,
  sortCondition,
  FlatSection,
  flatMedia,
} from '../types/interfaces';

export const sectionizeMedia = (
  medias: Array<Asset>,
  sortCondition_i: 'day' | 'month',
) => {
  let result: Array<photoChunk> = [];
  if (medias && medias.length) {
    let currentTimestamp = '';
    let timestampIndexInData = -1;
    for (let media of medias) {
      let mediaTimestamp = timestampToDate(
        media.modificationTime,
        sortCondition_i,
      );
      if (currentTimestamp !== mediaTimestamp) {
        currentTimestamp = mediaTimestamp;
        timestampIndexInData = result.findIndex(
          (x: photoChunk) => x.date.value === currentTimestamp,
        );
      }
      if (timestampIndexInData > -1) {
        if (result[timestampIndexInData].data) {
          result[timestampIndexInData].data.push({value:media});
        } else {
          result[timestampIndexInData].data = [];
          result[timestampIndexInData].data.push({value:media});
        }
      } else {
        if (currentTimestamp) {
          let temp = [];
          temp.push({value:media});
          result.push({date: {value:currentTimestamp}, data: temp});
          timestampIndexInData = result.length - 1;
        }
      }
    }
  }
  return result;
};

export const flattenDates = (
  sectionedMedias: Array<photoChunk>,
  flatMedias: Array<flatMedia> = [],
  headerIndexes:Array<{header:string;index:number}> = [],
) => {
  let index:number = 0;
  for(let section of sectionedMedias){
    let dataLength:number = section.data.length;
    let prevIndex = headerIndexes.findIndex(x => x.header === section.date.value);
    if(prevIndex > -1){
      index = headerIndexes[prevIndex].index;
      for(let i=0; i<headerIndexes.length; i++){
        if(headerIndexes[i].index > index){
          headerIndexes[i].index = headerIndexes[i].index + dataLength;
        }
      }
    }else{
      index = flatMedias.length;
      headerIndexes.push({header:section.date.value,index:index});
      flatMedias.push(section.date);
    }
    
    if(dataLength){
      flatMedias.splice(index+1, 0, ...section.data);
    }
  }
  let result:FlatSection = {
    flatMedias: flatMedias,
    headerIndexes: headerIndexes,
  };
  return result;
}
export const timestampToDate = (
  timestamp: number,
  condition: 'day' | 'month',
) => {
  let date = new Date(timestamp);
  let month = date.getUTCMonth(); //months from 1-12
  let day = date.getUTCDate();
  let year = date.getUTCFullYear();
  let result;

  if (condition === 'day') {
    result = new Date(year, month, day).toString().split(year.toString())[0];
  } else if (condition === 'month') {
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

export const getStorageMedia = (
  permission: boolean = false,
  limit: number = 20,
  after: string = '0',
  createdBefore: Date | number | undefined = undefined,
  createdAfter: Date | number | undefined = undefined,
  mediaType: Array<any> = [
    MediaType.photo,
    MediaType.video,
  ],
) => {
  if (after === '') {
    after = '0';
  }
  if (permission) {
    let mediaFilter: AssetsOptions = {
      first: limit,
      mediaType: mediaType,
      sortBy: [SortBy.modificationTime],
      after: after,
      createdAfter: createdAfter,
      createdBefore: createdBefore,
    };

    let media = getAssetsAsync(mediaFilter);
    return media;
  }
};

export const pow2abs = (a: number, b: number) => {
  return Math.pow(Math.abs(a - b), 2);
};

export const changeSortCondition: changeSortConditionAndNumColumns = (
  sortCondition_i: sortCondition,
  pinchOrZoom: 'pinch' | 'zoom' | undefined,
  numCols: 2 | 3 | 4,
) => {
  let result:{sortCondition: sortCondition,numColumns:2|3|4} = {
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
