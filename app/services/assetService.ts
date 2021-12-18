import * as MediaLibrary from "expo-media-library"
import { manipulateAsync, SaveFormat, ImageResult } from "expo-image-manipulator"
import moment from "moment"

import { RecyclerAssetListSection, ViewType } from "../types"

export const generateThumbnail = async (assets: MediaLibrary.Asset[]) => {
  const result: ImageResult[] = []
  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index]
    if (asset.mediaType === "photo" && asset.uri) {
      const thumbnail = await manipulateAsync(asset.uri, [{ resize: { height: 200 } }], {
        compress: 1,
        format: SaveFormat.PNG,
        base64: false,
      })
      result.push(thumbnail)
    }
  }
  return result
}

export const categorizeAssets = (assets: MediaLibrary.Asset[]) => {
  const sections: RecyclerAssetListSection[] = []
  let lastMonth = moment().format("MMMM YYYY")
  let lastDay = null
  for (const asset of assets) {
    const times = moment(asset.creationTime).format("MMMM YYYY|dddd, MMM D, YYYY")
    const month = times.split("|")[0]
    const day = times.split("|")[1]
    if (month !== lastMonth) {
      sections.push({
        id: month,
        data: month,
        type: ViewType.MONTH,
      })
      lastMonth = month
    }
    if (day !== lastDay) {
      sections.push({
        id: `${month}-${day}`,
        data: day,
        type: ViewType.DAY,
      })
      lastDay = day
    }
    sections.push({
      id: asset.id,
      data: asset,
      type: ViewType.ASSET,
    })
  }
  return sections
}

export const getAllMedias = async () => {
  try {
    const medias = await MediaLibrary.getAssetsAsync({
      first: 999999,
      sortBy: "creationTime",
    })
    return medias;
  } catch (error) {
    console.error("error", error)
    throw error;
  }
}
