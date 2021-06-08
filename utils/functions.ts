import {
  Asset,
  AssetsOptions,
  getAssetsAsync,
  MediaType,
  SortBy,
} from 'expo-media-library';
import {
  changeSortConditionAndNumColumns,
  FlatSection,
  headerIndex,
  layout as Layout,
  sortCondition,
  story,
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

export const ipfsHash = (_media: Asset) => {
  let result: string = Math.random().toString(36).substring(7);
  return result;
};

export const prepareLayout = (
  newMedias: Array<Asset>,
  sortConditions: Array<'day' | 'month'>,
  lastTimestamp: number = 0,
  lastIndex: number,
) => {
  let output:FlatSection = {layout:[], headerIndexes:[], stories: [], lastTimestamp: lastTimestamp};
  
    let layout: Array<layout> = [];
    let headerIndexes:Array<headerIndex> = [];
    let stories:story[] = [];
    let count = {'day':0, 'month':0};
    if(lastTimestamp===0){
      layout.push({value:'story placeholder', sortCondition: '', index: -1, selected:false});
    }

    let lastTimestampObj = timestampToDate(
      lastTimestamp,
      [...sortConditions, 'year'],
    );
    
    let lastYear = {'day':(lastTimestampObj.year||''), 'month': (lastTimestampObj.year||'')};

    let counter1:{[key:number]:number} = {};
    let counter2:{[key:number]:number} = {};
    let counter3:{[key:number]:number} = {};
    let highlightedMedia:{[key:string]:boolean}={};

    for(let i=0; i<newMedias.length; i++){
      let yearStart = {'day':'','month':''};
      let mediaTimestampObj = timestampToDate(
        newMedias[i].modificationTime,
        [...sortConditions, 'year'],
      );

      let mediaTimestampYear = mediaTimestampObj.year;

      //Creating stories
      let now = new Date();
      now.setHours(0, 0, 0, 0);

      let media = new Date(newMedias[i].modificationTime);
      media.setHours(0, 0, 0, 0);

        //Current photos in the same year
        if((now.getDate()===media.getDate()) && now.getFullYear()===media.getFullYear()){
          if(!counter1[media.getMonth()]){
            counter1[media.getMonth()] = 0;
          }
          counter1[media.getMonth()] = counter1[media.getMonth()] + 1;
          if(!stories[0] || !stories[0].medias){
            stories[0] = {medias:[], text: 'Recent'};
          }
          if(counter1[media.getMonth()] <= 2 && !highlightedMedia[newMedias[i].id]){
            stories[0].medias.push(newMedias[i]);
            highlightedMedia[newMedias[i].id]=true;
          }
        }

        //Current photos in the past years
        if(now.getDate()===media.getDate() && now.getMonth()===media.getMonth() && now.getFullYear()!==media.getFullYear() ){
          let difference = now.getFullYear() - media.getFullYear();
          if(!counter2[difference]){
            counter2[difference] = 0;
          }
          counter2[difference] = counter2[difference] + 1;

          if(!stories[difference] || !stories[difference].medias){
            stories[difference] = {medias:[], text: difference+' '+(difference===1?'year':'years')+' ago'};
          }
          if(counter2[difference]<=6 && !highlightedMedia[newMedias[i].id]){
            stories[difference].medias.push(newMedias[i]);
            highlightedMedia[newMedias[i].id]=true;
          }
        }

        //Current photos in the past months-->This is temporary for demo
        if(now.getDate()===media.getDate() && now.getMonth()!==media.getMonth() && now.getFullYear()===media.getFullYear() ){
          let difference = now.getMonth() - media.getMonth();
          if(difference < 0){difference = 12+difference;}
          if(!counter3[difference]){
            counter3[difference] = 0;
          }
          counter3[difference] = counter3[difference] + 1;

          if(!stories[difference] || !stories[difference].medias){
            stories[difference] = {medias:[], text: difference+' '+(difference===1?'month':'months')+' ago'};
          }
          if(counter3[difference]<=6 && !highlightedMedia[newMedias[i].id]){
            stories[difference].medias.push(newMedias[i]);
            highlightedMedia[newMedias[i].id]=true;
          }
        }

      //End of creating stories

      //Creating media and headerIndex
      for(let j=0;j<sortConditions.length;j++){
        let sortCondition_j = sortConditions[j];
        if(mediaTimestampObj[sortCondition_j] !== lastTimestampObj[sortCondition_j] || lastYear[sortCondition_j] !== mediaTimestampYear){
          lastTimestampObj[sortCondition_j] = mediaTimestampObj[sortCondition_j];
          
          layout.push({value:mediaTimestampObj[sortCondition_j], sortCondition: sortCondition_j, index:-1, selected:false});
          
          let headerIndexLength = headerIndexes.length;
          let lastHeaderIndex = [...headerIndexes].reverse().findIndex(headerIndex => headerIndex.sortCondition === sortCondition_j);
          if(lastHeaderIndex>-1){
            headerIndexes[headerIndexLength -1 -lastHeaderIndex].count = count[sortCondition_j];
          }
          if(mediaTimestampYear !== lastYear[sortCondition_j]){
            lastYear[sortCondition_j] = mediaTimestampObj.year;
            yearStart[sortCondition_j] = lastYear[sortCondition_j];
          }
          headerIndexes.push({header:mediaTimestampObj[sortCondition_j], index:layout.length-1+lastIndex, count: 0, yearStart: yearStart[sortCondition_j], sortCondition: sortCondition_j, timestamp: newMedias[i].modificationTime});
          count[sortCondition_j] = 0;
        }
        count[sortCondition_j] = count[sortCondition_j] + 1;
      }

      layout.push({value:newMedias[i], sortCondition: '', index: i+lastIndex, selected:false});

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

    stories = stories.filter(x=>x?.medias[0]?.uri);
    let lastMediaTimestamp = 0;
    if(newMedias && newMedias.length){
      lastMediaTimestamp = newMedias[newMedias.length-1].modificationTime;
    }
    output = {layout:layout, headerIndexes: headerIndexes, stories: stories, lastTimestamp:lastMediaTimestamp};
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
  let result: {[key: string]: string} = {};
  for (let i = 0; i < conditions.length; i++) {
    if (conditions[i] === 'day') {
      result.day = new Date(year, month, day)
        .toString()
        .split(year.toString())[0];
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
    } else if (conditions[i] === 'year') {
      result.year = String(year);
    }
  }
  return result;
};

export const getStorageMedia = async (
  permission: boolean = false,
  limit: number = 99999999999999,
  after: string = '',
  createdBefore: Date | number | undefined = undefined,
  createdAfter: Date | number | undefined = undefined,
  mediaType: Array<any> = [MediaType.photo, MediaType.video],
) => {
  if (permission) {
    let mediaFilter: AssetsOptions = {
      mediaType: mediaType,
      sortBy: [SortBy.modificationTime],
    };
    if (limit) {
      mediaFilter.first = limit;
    } else {
      mediaFilter.first = 9999999999999999;
    }
    if (after) {
      mediaFilter.after = after;
    }
    if (createdAfter) {
      mediaFilter.createdAfter = createdAfter;
    }
    if (createdBefore) {
      mediaFilter.createdBefore = createdBefore;
    }

    let media = getAssetsAsync(mediaFilter);
    return media;
  }
};

export const calcLayoutHeight = (
  numColumns: 2 | 3 | 4,
  headerIndexes: Array<{
    header: string;
    index: number;
    count: number;
    yearStart: string;
  }>,
  screenWidth: number,
  headerHeight: number,
) => {
  return headerIndexes.reduce((total, elm) => {
    return (
      total +
      (Math.ceil(elm.count / numColumns) * (screenWidth / numColumns) +
        headerHeight)
    );
  }, 0);
  /*let height:number = 0;
  for(let i=0;i<headerIndexes.length;i++){
    height = height + (Math.ceil(headerIndexes[i].count/numColumns)*(screenWidth/numColumns)+headerHeight)
  }
  return height;*/
};

export const pow2abs = (a: number, b: number) => {
  return Math.pow(Math.abs(a - b), 2);
};

export const prettyTime = (seconds: number) => {
  const format = (val: number) => {
    return `0${Math.floor(val)}`.slice(-2);
  };
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  if (hours > 1) {
    return [hours, minutes, seconds % 60].map(format).join(':');
  } else if (minutes > 1) {
    return [minutes, seconds % 60].map(format).join(':');
  } else {
    return '0:' + [seconds % 60].map(format).join(':');
  }
};

export const changeSortCondition: changeSortConditionAndNumColumns = (
  sortCondition_i: sortCondition,
  pinchOrZoom: 'pinch' | 'zoom' | undefined,
  numCols: 2 | 3 | 4,
) => {
  let result: {sortCondition: sortCondition; numColumns: 2 | 3 | 4} = {
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

export const calcImageDimension = (
  media: Asset | undefined,
  SCREEN_HEIGHT: number,
  SCREEN_WIDTH: number,
) => {
  let imageWidth_t = SCREEN_WIDTH;
  let imageHeight_t = SCREEN_HEIGHT;
  if (media) {
    if (media.height > SCREEN_HEIGHT && media.width > SCREEN_WIDTH) {
      if (media.height / media.width > SCREEN_HEIGHT / SCREEN_WIDTH) {
        imageWidth_t =
          (media.width * SCREEN_HEIGHT) /
          (media.height === 0 ? 1 : media.height);
      } else {
        imageHeight_t =
          (SCREEN_WIDTH * media.height) / (media.width === 0 ? 1 : media.width);
      }
    } else if (media.height > SCREEN_HEIGHT) {
      imageWidth_t =
        (media.width * SCREEN_HEIGHT) / (media.height === 0 ? 1 : media.height);
    } else if (media.width > SCREEN_WIDTH) {
      imageHeight_t =
        (SCREEN_WIDTH * media.height) / (media.width === 0 ? 1 : media.width);
    } else if (media.height <= SCREEN_HEIGHT && media.width <= SCREEN_WIDTH) {
      imageHeight_t = media.height;
      imageWidth_t = media.width;
    }
  }
  return {height: imageHeight_t, width: imageWidth_t};
};
