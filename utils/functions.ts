import * as MediaLibrary from "expo-media-library";
import { NativeTouchEvent } from "react-native";
import {
  changeSortConditionAndNumColumns,
  photoChunk,
  sortCondition,
  sortedPhotos,
} from "../types/interfaces";

export const sortPhotos = (
  medias: Array<MediaLibrary.Asset>,
  sortCondition: "day" | "month"
) => {
  let result: any = {};
  console.log("medias: "+JSON.stringify(medias, null, 2));
  if(medias && medias.length){
    let timestamps = medias
      .map((media) => media.modificationTime)
      .sort((a, b) => b - a);
    let timestamps_str = timestamps.map((timestamp) => timestamp.toString());
    if (sortCondition == "day") {
      for (let TS of timestamps_str) {
        result[timestampToDate(+TS, "day")] = [];
      }
      for (let media of medias) {
        result[timestampToDate(media.modificationTime, "day")].push(media);
      }
      //console.log("photos2"+JSON.stringify(photos, null, 2));
      return result;
    } else if (sortCondition == "month") {
      for (let TS of timestamps_str) {
        result[timestampToDate(+TS, "month")] = [];
      }
      for (let media of medias) {
        result[timestampToDate(media.modificationTime, "month")].push(media);
      }

      return result;
    }
  }
  return result;
};

// export const splitDate = (date: string) => {
//   let
// }

export const timestampToDate = (
  timestamp: number,
  condition: "day" | "month"
) => {
  let date = new Date(timestamp);
  let month = date.getUTCMonth() + 1; //months from 1-12
  let day = date.getUTCDate();
  let year = date.getUTCFullYear();
  let result;

  if (condition == "day") {
    result = new Date(year, month, day).toString().split(year.toString())[0];
  } else if (condition == "month") {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    result = monthNames[new Date(year, month).getMonth()];
  }
  if (result) {
    return result;
  } else {
    return "unknown";
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
  ]
) => {
  if(after==''){
    after = '0';
  }
  console.log([
    "start getStorageMedia with parameters: ",
    { parameters: { permission: permission, limit: limit, after: after } },
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

    let media =  MediaLibrary.getAssetsAsync(mediaFilter);
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
  sortCondition,
  pinchOrZoom,
  numCols
) => {
  let result = {
    sortCondition: "day",
    numColumns: 2,
  };

  if (pinchOrZoom === "zoom") {
    if (sortCondition === "day") {
      if (numCols === 2) {
        console.log("A");
        result = { ...result, sortCondition: "day", numColumns: 2 };
      } else if (numCols === 3) {
        console.log("B");
        result = { ...result, sortCondition: "day", numColumns: 2 };
      }
    } else if (sortCondition === "month") {
      console.log("C");
      result = { ...result, sortCondition: "day", numColumns: 3 };
    }
  }

  if (pinchOrZoom === "pinch") {
    if (sortCondition === "day") {
      if (numCols === 2) {
        console.log("D");
        result = { ...result, sortCondition: "day", numColumns: 3 };
      } else if (numCols === 3) {
        console.log("E");
        result = { ...result, sortCondition: "month", numColumns: 4 };
      }
    } else if (sortCondition === "month") {
      console.log("F");
      result = { ...result, sortCondition: "month", numColumns: 4 };
    }
  }

  return result;
};

export const opacityTransition = (
  sortCondition: sortCondition,
  numColumns: 2 | 3 | 4,
  pinchOrZoom: "pinch" | "zoom" | undefined
) => {
  let result: any = {
    day: {
      col: {
        2: [0, 0],
        3: [0, 0],
      },
    },
    month: {
      col: {
        4: [0, 0],
      },
    },
  };

  if (sortCondition === "day") {
    if (numColumns === 2) {
      result = {
        ...result,
        day: { ...result.day, col: { ...result.day.col, 2: [1, 0] } },
      };
    } else if (numColumns === 3) {
      result = {
        ...result,
        day: { ...result.day, col: { ...result.day.col, 3: [1, 0] } },
      };
    }
  } else if (sortCondition === "month") {
    if (numColumns === 4) {
      result = {
        ...result,
        month: { ...result.month, col: { ...result.month.col, 4: [1, 0] } },
      };
    }
  }

  if (pinchOrZoom === undefined) {
    return result;
  }

  let newSortCondition = changeSortCondition(
    sortCondition,
    pinchOrZoom,
    numColumns
  ).sortCondition;
  let newNumColumns = changeSortCondition(
    sortCondition,
    pinchOrZoom,
    numColumns
  ).numColumns;

  console.log("newNumColumns", newNumColumns);
  console.log("newSortCondition", newSortCondition);

  if (newSortCondition === "day") {
    if (newNumColumns === 2) {
      result = {
        ...result,
        day: { ...result.day, col: { ...result.day.col, 2: [0, 1] } },
      };
    } else if (newNumColumns === 3) {
      result = {
        ...result,
        day: { ...result.day, col: { ...result.day.col, 3: [0, 1] } },
      };
    }
  } else if (newSortCondition === "month") {
    if (newNumColumns === 4) {
      result = {
        ...result,
        month: { ...result.month, col: { ...result.month.col, 4: [0, 1] } },
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
