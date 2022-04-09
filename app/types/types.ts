import { Asset as ExpoAsset } from "expo-media-library"

export type Asset = ExpoAsset & {}
export type AssetStory = {
  id: string
  data: Asset[]
  title: string | undefined
}
export type GroupHeader = {
  title: string | undefined
  subGroupIds: string[]
}
export type RecyclerAssetListSectionData = AssetStory[] | Asset | GroupHeader
