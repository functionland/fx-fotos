import { Asset as ExpoAsset } from "expo-media-library"

export type Asset = ExpoAsset & {}
export type AssetStory = {
  id: string
  data: Asset[]
  title: string | undefined
}
export type GroupHeader = {
  title: string | undefined
  date?:Date
  subGroupIds: string[]
}
export type RecyclerAssetListSectionData = AssetStory[] | Asset | GroupHeader

export type Library = {
  title: string | undefined
  assets:Asset[]
}