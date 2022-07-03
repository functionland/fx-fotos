import { Asset as ExpoAsset } from "expo-media-library"
import { AssetEntity } from "../realmdb/entities"
export type Asset = ExpoAsset & AssetEntity
export type AssetStory = {
  id: string
  data: Asset[]
  title: string | undefined
}
export type GroupHeader = {
  title: string | undefined
  date?: Date
  subGroupIds: string[]
}
export type RecyclerAssetListSectionData = AssetStory[] | Asset | GroupHeader

export type Library = {
  title: string | undefined
  assets: Asset[]
}

export type AssetMeta = {
  id: string
  name: string
  jwe: unknown
  ownerId: string
  date: string
}

export type ShareMeta = {
  id: string //uid
  fileName: string
  ownerId: string //did
  cid: string
  shareWithId: string // did
  jwe: unknown
  date: string
}
