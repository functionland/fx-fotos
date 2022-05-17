import * as MediaLibrary from "expo-media-library"
import { manipulateAsync, SaveFormat, ImageResult } from "expo-image-manipulator"
import moment from "moment"

import { RecyclerAssetListSection, ViewType, GroupHeader, Library } from "../types"
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
  let lastMonthHeader: GroupHeader = null
  let lastDayHeader: GroupHeader = null
  for (const asset of assets) {
    const times = moment(asset.modificationTime).format("MMMM YYYY|dddd, MMM D, YYYY")
    const month = times.split("|")[0]
    const day = times.split("|")[1]

    // Create Month group sections
    if (month !== lastMonth) {
      lastMonth = month
      lastMonthHeader = {
        title: month,
        date: new Date(asset.modificationTime),
        subGroupIds: [],
      }
      sections.push({
        id: month,
        data: {
          ...lastMonthHeader,
        },
        type: ViewType.MONTH,
      })
    }
    // Create day group section
    if (day !== lastDay) {
      lastDay = day
      lastDayHeader = {
        title: day,
        date: new Date(asset.modificationTime),
        subGroupIds: [],
      }
      const daySection: RecyclerAssetListSection = {
        id: `${month}-${day}`,
        data: {
          ...lastDayHeader,
        },
        type: ViewType.DAY,
      }
      sections.push(daySection)
      if (lastMonthHeader) {
        lastDayHeader.subGroupIds.push(daySection.id)
      }
    }
    // Add assets
    const assetSection: RecyclerAssetListSection = {
      id: asset.id,
      data: asset,
      type: ViewType.ASSET,
    }
    sections.push(assetSection)
    if (lastDayHeader) {
      lastDayHeader.subGroupIds.push(assetSection.id)
    }
  }
  return sections
}
export const getLibraries = (assets: MediaLibrary.Asset[]): Library[] => {
  const librariesObj: Record<string, MediaLibrary.Asset[]> = {}

  //Group assets based on last directory name
  for (const asset of assets) {
    if (!asset || !asset.uri) continue
    const uriParts = asset?.uri?.split("/")
    const title = uriParts?.[uriParts.length - 2]
    if (!librariesObj[title]) librariesObj[title] = []
    librariesObj[title].push(asset)
  }

  const libraries = Object.keys(librariesObj).map((title) => {
    return {
      title,
      assets: librariesObj[title],
    } as Library
  })

  return libraries
}

export const getAssets = async (
  pageSize = 100,
  afterAssetId: string,
  sortBy: MediaLibrary.SortByValue[] | MediaLibrary.SortByValue = "modificationTime",
): Promise<MediaLibrary.PagedInfo<MediaLibrary.Asset>> => {
  try {
    const medias = await MediaLibrary.getAssetsAsync(
      afterAssetId
        ? {
            first: pageSize,
            after: afterAssetId,
            sortBy: sortBy,
          }
        : {
            first: pageSize,
            sortBy: sortBy,
          },
    )
    return medias
  } catch (error) {
    console.error("error", error)
    throw error
  }
}
export const deleteAssets = async (assetIds: string[]): Promise<boolean> => {
  try {
    const deleted = await MediaLibrary.deleteAssetsAsync(assetIds)
    return deleted
  } catch (error) {
    console.error("error", error)
    throw error
  }
}
