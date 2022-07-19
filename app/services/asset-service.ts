import moment from "moment"
import * as MediaLibrary from "expo-media-library"
import { manipulateAsync, SaveFormat, ImageResult } from "expo-image-manipulator"

import { RecyclerAssetListSection, ViewType, GroupHeader, Library, AssetStory } from "../types"
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

// const TODAY = new Date()
// const startOfMonth = dateFns.startOfMonth(TODAY)
// const storyTimeLine = (() => {
//   const timeLineCount = 13
//   const temp = []
//   for (let i = 0; i < timeLineCount; i++) {
//     if (i === 0) {
//       temp.push(startOfMonth)
//       continue
//     }

//     temp.push(dateFns.subMonths(temp[i - 1], 1))
//   }

//   return temp.map((item) => {
//     return { id: item.toString(), title: item.toString(), data: [] }
//   })
// })()

// const categorizeStoryies = (asset: MediaLibrary.Asset) => {
//   for (let i = 0; i < storyTimeLine.length; i++) {
//     if (dateFns.isSameMonth(new Date(storyTimeLine[i].id), asset.modificationTime)) {
//       storyTimeLine[i].data.push(asset)
//     }
//   }
// }

const getAssetStoryCategory = (modificationTime: number) => {
  const diff = (new Date().getTime() - modificationTime) / (1000 * 60 * 60 * 24)

  if (diff <= 14) return "Recently"
  else if (diff > 14 && diff <= 60) return "2 Months ago"
  else if (diff > 60 && diff <= 90) return "3 Months ago"
  else if (diff > 90 && diff <= 120) return "4 Months ago"
  else if (diff > 150 && diff <= 180) return "6 Months ago"
  else if (diff > 180 && diff <= 360) return "1 Year ago"
  else if (diff > 360) return "More than one yeaar"
  return null
}

export const categorizeAssets = (assets: MediaLibrary.Asset[]) => {
  const sections: RecyclerAssetListSection[] = []
  let lastMonth = moment().format("MMMM YYYY")
  let lastDay = null
  let lastMonthHeader: GroupHeader = null
  let lastDayHeader: GroupHeader = null
  const storiesObj: Record<string, MediaLibrary.Asset[]> = {}

  for (const asset of assets) {
    // Make story objects
    // Filter assets to get camera folder
    // if (asset?.modificationTime && asset.uri?.toLowerCase().includes("/dcim/camera/")) {
    const categoryName = getAssetStoryCategory(asset.modificationTime)
    if (categoryName && !storiesObj[categoryName]) storiesObj[categoryName] = []
    if (categoryName) storiesObj[categoryName].push(asset)
    // }

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

  // Create story section
  const storySection: RecyclerAssetListSection = {
    id: "story_highlight",
    type: ViewType.STORY,
    data: Object.keys(storiesObj)
      // Sort stories based on first asset
      .sort((a, b) => storiesObj[a]?.[0].modificationTime < storiesObj[b]?.[0].modificationTime)
      .map((key, index) => {
        return {
          id: `story_${index}_${storiesObj[key]?.length}`,
          data: storiesObj[key],
          title: key,
        } as AssetStory
      }),
  }
  return [storySection, ...sections]
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
            mediaType: ["photo", "video"],
          }
        : {
            first: pageSize,
            sortBy: sortBy,
            mediaType: ["photo", "video"],
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
