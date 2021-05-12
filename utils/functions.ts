import {Asset, MediaType, AssetsOptions, SortBy, getAssetsAsync} from 'expo-media-library';
import {
  changeSortConditionAndNumColumns,
  photoChunk,
  sortCondition,
  FlatSection,
  flatMedia,
} from '../types/interfaces';

/*
export const sectionizeMedia = (
  medias: Array<Asset>,
  sortCondition_i: 'day' | 'month',
  sectionedMedia: Array<photoChunk> = [],
) => {
  if (medias && medias.length) {
    let currentTimestamp = '';
    let timestampIndexInData = -1;
    for (let media of medias) {
      let mediaTimestamp = timestampToDate(
        media.modificationTime,
        sortCondition_i,
      ).value;
      if (currentTimestamp !== mediaTimestamp) {
        currentTimestamp = mediaTimestamp;
        timestampIndexInData = sectionedMedia.findIndex(
          (x: photoChunk) => x.date.value === currentTimestamp,
        );
      }
      if (timestampIndexInData > -1) {
        if (sectionedMedia[timestampIndexInData].data) {
          sectionedMedia[timestampIndexInData].data.push({value:media});
        } else {
          sectionedMedia[timestampIndexInData].data = [];
          sectionedMedia[timestampIndexInData].data.push({value:media});
        }
      } else {
        if (currentTimestamp) {
          let temp = [];
          temp.push({value:media});
          sectionedMedia.push({date: {value:currentTimestamp}, data: temp});
          timestampIndexInData = sectionedMedia.length - 1;
        }
      }
    }
  }
  return sectionedMedia;
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
    sectionedMedias: sectionedMedias
  };
  return result;
}*/

export const ipfsHash = (
  media: Asset,
) => {
  let result:string = Math.random().toString(36).substring(7);
  return result;
}

export const prepareLayout = (
  newMedias: Array<Asset>,
  sortConditions: Array<'day' | 'month'>,
  lastTimestamp: number = 0,
) => {
  let output:{[key:string]:FlatSection} = {};
  
  for(let j=0; j<sortConditions.length; j++){
    let layout:Array<Asset|string> = [];
    let headerIndexes:Array<{header:string;index:number;count:number;yearStart:string}> = [];
    let count = 0;
    let sortCondition_i = sortConditions[j];
    
    let lastTimestampObj = timestampToDate(
      lastTimestamp,
      sortCondition_i,
    );
    let lastTimestampString = lastTimestampObj.value;
    let lastYear = lastTimestampObj.year;
    for(let i=0; i<newMedias.length; i++){
      let yearStart = '';
      let mediaTimestampObj = timestampToDate(
        newMedias[i].modificationTime,
        sortCondition_i,
      );
      let mediaTimestampString = mediaTimestampObj.value;
      let mediaTimestampYear = mediaTimestampObj.year;
      if(lastTimestampString !== mediaTimestampString && lastYear !== mediaTimestampYear){
        lastTimestampString = mediaTimestampString;
        layout.push(lastTimestampString);
        if(headerIndexes.length>=1){
          headerIndexes[headerIndexes.length-1].count = count;
        }
        if(mediaTimestampYear !== lastTimestampString){
          yearStart = mediaTimestampYear;
        }
        headerIndexes.push({header:lastTimestampString, index:layout.length-1, count: 0, yearStart: yearStart});
        count = 0;
      }
      count = count + 1;
      layout.push(newMedias[i]);
    }
    output[sortCondition_i] = {layout:layout, headerIndexes: headerIndexes};
  }
  return output;
}

export const timestampToDate = (
  timestamp: number,
  condition: ('day' | 'month') | 'year',
) => {
  let date = new Date(timestamp);
  let month = date.getUTCMonth(); //months from 1-12
  let day = date.getUTCDate();
  let year = date.getUTCFullYear();
  let result:{value:string, year:string} = {value:'', year: String(year)};

  if (condition === 'day') {
    result.value = new Date(year, month, day).toString().split(year.toString())[0];
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
    result.value = monthNames[new Date(year, month).getMonth()];
  }else if (condition === 'year') {
    result.value = String(year);
  }
  return result;
};

export const getStorageMedia = (
  permission: boolean = false,
  limit: number = 99999999999999,
  after: string = '',
  createdBefore: Date | number | undefined = undefined,
  createdAfter: Date | number | undefined = undefined,
  mediaType: Array<any> = [
    MediaType.photo,
    MediaType.video,
  ],
) => {
  if (permission) {
    let mediaFilter: AssetsOptions = {
      first: limit,
      mediaType: mediaType,
      sortBy: [SortBy.modificationTime],
    };
    if(after){
      mediaFilter.after = after;
    }
    if(createdAfter){
      mediaFilter.createdAfter = createdAfter;
    }
    if(createdBefore){
      mediaFilter.createdBefore = createdBefore;
    }

    let media = getAssetsAsync(mediaFilter);
    return media;
  }
};

export const calcLayoutHeight = (numColumns:2|3|4, headerIndexes:Array<{header:string;index:number;count:number;yearStart:string}> , screenWidth:number, headerHeight:number) => {
  return headerIndexes.reduce((total, elm)=>{return total+(Math.ceil(elm.count/numColumns)*(screenWidth/numColumns)+headerHeight);}, 0);
  /*let height:number = 0;
  for(let i=0;i<headerIndexes.length;i++){
    height = height + (Math.ceil(headerIndexes[i].count/numColumns)*(screenWidth/numColumns)+headerHeight)
  }
  return height;*/
}

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
