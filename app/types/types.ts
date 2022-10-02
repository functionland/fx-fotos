import { Asset as ExpoAsset } from 'expo-media-library'
import { AssetEntity } from '../realmdb/entities'

export type MediaTypeValue = 'audio' | 'photo' | 'video' | 'unknown'
export type Asset = ExpoAsset & AssetEntity
export type PagedInfo<T> = {
  /**
   * A page of [`Asset`](#asset)s fetched by the query.
   */
  assets: T[]
  /**
   * ID of the last fetched asset. It should be passed as `after` option in order to get the
   * next page.
   */
  endCursor: string
  /**
   * Whether there are more assets to fetch.
   */
  hasNextPage: boolean
  /**
   * Estimated total number of assets that match the query.
   */
  totalCount: number
}
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
  id: string // uid
  fileName: string
  ownerId: string // did
  cid: string
  shareWithId: string // did
  jwe: unknown
  date: string
}
