import * as MediaLibrary from 'expo-media-library';
import {
  changeSortConditionAndNumColumns,
  photoChunk,
  sortCondition,
} from '../types/interfaces';

export const sectionizeMedia = (
  medias: Array<MediaLibrary.Asset>,
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
          (x: photoChunk) => x.date === currentTimestamp,
        );
      }
      if (timestampIndexInData > -1) {
        if (result[timestampIndexInData].data) {
          result[timestampIndexInData].data[0].push(media);
        } else {
          result[timestampIndexInData].data = [[]];
          result[timestampIndexInData].data[0].push(media);
        }
      } else {
        if (currentTimestamp) {
          let temp = [];
          temp.push(media);
          result.push({date: currentTimestamp, data: [temp]});
          timestampIndexInData = result.length - 1;
        }
      }
    }
  }
  return result;
};

export const sortPhotos = (
  medias: Array<MediaLibrary.Asset>,
  sortCondition_i: 'day' | 'month',
) => {
  let result: any = {};
  if (medias && medias.length) {
    let timestamps = medias
      .map((media) => media.modificationTime)
      .sort((a, b) => b - a);
    let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
    if (sortCondition_i === 'day') {
      for (let TS of timestamps_str) {
        result[timestampToDate(+TS, 'day')] = [];
      }
      for (let media of medias) {
        result[timestampToDate(media.modificationTime, 'day')].push(media);
      }
      return result;
    } else if (sortCondition_i === 'month') {
      for (let TS of timestamps_str) {
        result[timestampToDate(+TS, 'month')] = [];
      }
      for (let media of medias) {
        result[timestampToDate(media.modificationTime, 'month')].push(media);
      }

      return result;
    }
  }
  //console.log(JSON.stringify(result));
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
    MediaLibrary.MediaType.photo,
    MediaLibrary.MediaType.video,
  ],
) => {
  if (after === '') {
    after = '0';
  }
  console.log([
    'start getStorageMedia with parameters: ',
    {parameters: {permission: permission, limit: limit, after: after}},
  ]);
  if (permission) {
    let mediaFilter: MediaLibrary.AssetsOptions = {
      first: limit,
      mediaType: mediaType,
      sortBy: [MediaLibrary.SortBy.modificationTime],
      after: after,
      createdAfter: createdAfter,
      createdBefore: createdBefore,
    };

    let media = MediaLibrary.getAssetsAsync(mediaFilter);
    return media;
  }
};

export const pow2abs = (a: number, b: number) => {
  return Math.pow(Math.abs(a - b), 2);
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  return distance;
};

export const findDiameter = (width: number, height: number) => {
  let pow2 = Math.pow(width, 2) + Math.pow(height, 2);

  return Math.sqrt(pow2);
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
        console.log('A');
        result = {...result, sortCondition: 'day', numColumns: 2};
      } else if (numCols === 3) {
        console.log('B');
        result = {...result, sortCondition: 'day', numColumns: 2};
      }
    } else if (sortCondition_i === 'month') {
      console.log('C');
      result = {...result, sortCondition: 'day', numColumns: 3};
    }
  }

  if (pinchOrZoom === 'zoom') {
    if (sortCondition_i === 'day') {
      if (numCols === 2) {
        console.log('D');
        result = {...result, sortCondition: 'day', numColumns: 3};
      } else if (numCols === 3) {
        console.log('E');
        result = {...result, sortCondition: 'month', numColumns: 4};
      }
    } else if (sortCondition_i === 'month') {
      console.log('F');
      result = {...result, sortCondition: 'month', numColumns: 4};
    }
  }

  return result;
};

export const opacityTransition = (
  sortCondition_i: sortCondition,
  numColumns: 2 | 3 | 4,
  pinchOrZoom: 'pinch' | 'zoom' | undefined,
) => {
  let result: any = {
    day: {
      col: {
        2: [0, 0, 0],
        3: [0, 0, 0],
      },
    },
    month: {
      col: {
        4: [0, 0, 0],
      },
    },
  };


    if(sortCondition_i === 'day' && numColumns === 2){
      if(pinchOrZoom==='zoom'){
        console.log("HERE11");
        result = {
          day: {
            col: {
              2: [0, 1, 0],
              3: [1, 0, 1],
            },
          },
          month: {
            col: {
              4: [0, 0, 0],
            },
          },
        };
      }else if(pinchOrZoom==='pinch'){
        console.log("HERE12");
        result = {
          day: {
            col: {
              2: [0, 1, 0],
              3: [0, 0, 0],
            },
          },
          month: {
            col: {
              4: [0, 0, 0],
            },
          },
        };
      }else{
        result = {
          day: {
            col: {
              2: [0, 1, 0],
              3: [0, 0, 0],
            },
          },
          month: {
            col: {
              4: [0, 0, 0],
            },
          },
        };
      }
    } else if(sortCondition_i === 'day' && numColumns === 3){
      if(pinchOrZoom==='zoom'){
        console.log("HERE21");
        result = {
          day: {
            col: {
              2: [0, 0, 0],
              3: [0, 1, 0],
            },
          },
          month: {
            col: {
              4: [1, 0, 1],
            },
          },
        };
      }else if(pinchOrZoom==='pinch'){
        console.log("HERE22");
        result = {
          day: {
            col: {
              2: [1, 0, 1],
              3: [0, 1, 0],
            },
          },
          month: {
            col: {
              4: [0, 0, 0],
            },
          },
        };
      }else{
        result = {
          day: {
            col: {
              2: [0, 0, 0],
              3: [0, 1, 0],
            },
          },
          month: {
            col: {
              4: [0, 0, 0],
            },
          },
        };
      }
    } else if(sortCondition_i === 'month' && numColumns === 4){
      if(pinchOrZoom==='zoom'){
        result = {
          ...result,
          month: {...result.month, col: {...result.month.col, 4: [0, 1, 0]}},
        };
      }else if(pinchOrZoom==='pinch'){
        result = {
          ...result,
          day: {...result.day, col: {...result.day.col, 3:[1, 0, 1]}},
          month: {...result.month, col: {...result.month.col, 4:[0, 1, 0]}}
        };
      }else{
        result = {
          day: {
            col: {
              2: [0, 0, 0],
              3: [0, 0, 0],
            },
          },
          month: {
            col: {
              4: [0, 1, 0],
            },
          },
        };
      }
    }

  return result;
};

export const groupPhotosByDate = (medias: any) => {
  let result: Array<photoChunk> = [];

  for (let sortedPhotosDate of Object.keys(medias)) {
    let _result = {
      date: sortedPhotosDate,
      data: medias[sortedPhotosDate],
    };
    result.push(_result);
  }
  return result;
};
