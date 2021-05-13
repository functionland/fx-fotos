import {Asset, MediaType, AssetsOptions, SortBy, getAssetsAsync} from 'expo-media-library';
import {
  changeSortConditionAndNumColumns,
  photoChunk,
  sortCondition,
  FlatSection,
  flatMedia,
  headerIndex,
  layout
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
  let output:FlatSection = {layout:[], headerIndexes:[]};
  
    let layout: Array<layout> = [];
    let headerIndexes:Array<headerIndex> = [];
    let count = {'day':0, 'month':0};

    
    let lastTimestampObj = timestampToDate(
      lastTimestamp,
      [...sortConditions, 'year'],
    );
    
    let lastYear = lastTimestampObj.year;
    for(let i=0; i<newMedias.length; i++){
      let yearStart = {'day':'','month':''};
      let mediaTimestampObj = timestampToDate(
        newMedias[i].modificationTime,
        [...sortConditions, 'year'],
      );

      let mediaTimestampYear = mediaTimestampObj.year;
      for(let j=0;j<sortConditions.length;j++){
        let sortCondition_j = sortConditions[j];
        if(mediaTimestampObj[sortCondition_j] !== lastTimestampObj[sortCondition_j] || lastYear !== mediaTimestampYear){
          lastTimestampObj[sortCondition_j] = mediaTimestampObj[sortCondition_j];
          lastYear = mediaTimestampObj.year;
          layout.push({value:mediaTimestampObj[sortCondition_j], sortCondition: sortCondition_j});
          
          let headerIndexLength = headerIndexes.length;
          let lastHeaderIndex = [...headerIndexes].reverse().findIndex(headerIndex => headerIndex.sortCondition === sortCondition_j);
          if(lastHeaderIndex>-1){
            headerIndexes[headerIndexLength -1 -lastHeaderIndex].count = count[sortCondition_j];
          }

          if(mediaTimestampYear !== lastYear){
            yearStart.day = lastYear;
          }
          headerIndexes.push({header:mediaTimestampObj[sortCondition_j], index:layout.length-1, count: 0, yearStart: yearStart.day, sortCondition: sortCondition_j});
          count[sortCondition_j] = 0;
        }
        count[sortCondition_j] = count[sortCondition_j] + 1;
      }

      layout.push({value:newMedias[i], sortCondition: ''});

    }

    let lastHeaderIndex = {'day':-1, 'month':-1};
    let headerIndexLength = headerIndexes.length;
    for(let j=0;j<sortConditions.length;j++){
      let sortCondition_j = sortConditions[j];
      lastHeaderIndex[sortCondition_j] = [...headerIndexes].reverse().findIndex(headerIndex => headerIndex.sortCondition === sortCondition_j);
      if(lastHeaderIndex[sortCondition_j]>-1){
        headerIndexes[headerIndexLength -1 -lastHeaderIndex[sortCondition_j]].count = count[sortCondition_j];
      }
    }

    output = {layout:layout, headerIndexes: headerIndexes};
  return output;
}

export const timestampToDate = (
  timestamp: number,
  conditions: Array<('day' | 'month') | 'year'>,
) => {
  let date = new Date(timestamp);
  let month = date.getUTCMonth(); //months from 1-12
  let day = date.getUTCDate();
  let year = date.getUTCFullYear();
  let result:{[key:string]:string} = {};
  for(let i=0;i<conditions.length;i++){
    if (conditions[i] === 'day') {
      result.day = new Date(year, month, day).toString().split(year.toString())[0];
    } else if (conditions[i] === 'month') {
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
      result.month = monthNames[new Date(year, month).getMonth()];
    }else if (conditions[i] === 'year') {
      result.year = String(year);
    }
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
      mediaType: mediaType,
      sortBy: [SortBy.modificationTime],
    };
    if(limit){
      mediaFilter.first = limit;
    }else{
      mediaFilter.first = 9999999999999999;
    }
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
