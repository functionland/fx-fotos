import { AssetEntity } from '../realmdb/entities'

export type MediaTypeValue = 'audio' | 'photo' | 'video' | 'unknown'
export declare type MediaSubtype =
  | 'depthEffect'
  | 'hdr'
  | 'highFrameRate'
  | 'livePhoto'
  | 'panorama'
  | 'screenshot'
  | 'stream'
  | 'timelapse'

export type Asset = {
  /**
   * Internal ID that represents an asset.
   */
  id: string
  /**
   * Filename of the asset.
   */
  filename: string
  /**
   * URI that points to the asset. `assets://*` (iOS), `file://*` (Android)
   */
  uri: string
  /**
   * Media type.
   */
  mediaType: MediaTypeValue
  /**
   * An array of media subtypes.
   * @platform ios
   */
  mediaSubtypes?: MediaSubtype[]
  /**
   * Width of the image or video.
   */
  width: number
  /**
   * Height of the image or video.
   */
  height: number
  /**
   * File creation timestamp.
   */
  creationTime: number
  /**
   * Last modification timestamp.
   */
  modificationTime: number
  /**
   * Duration of the video or audio asset in seconds.
   */
  duration: number
  /**
   * Album ID that the asset belongs to.
   * @platform android
   */
  albumId?: string
} & AssetEntity

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

export type SearchOptionType =
  | 'AssetType'
  | 'AssetSize'
  | 'AssetDimension'
  | 'AssetMime'
  | 'AssetFileSize'
  | 'AssetDateRange'
  | 'AssetDuration'

export type SearchOptionValueType = {
  id: string
  title: string
  type: SearchOptionType
  value: string | number | [number, number] | MediaTypeValue
  icon: string | undefined
  iconType: string | undefined
}
