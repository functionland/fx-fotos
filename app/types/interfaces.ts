import { ViewType, RecyclerAssetListSectionData } from './index'

export interface RecyclerAssetListSection {
  id: string
  data: RecyclerAssetListSectionData
  type: ViewType
}

export interface VideoPlayerMetadata {
  canPlayFastForward: boolean
  canPlayReverse: boolean
  canPlaySlowForward: boolean
  canPlaySlowReverse: boolean
  canStepBackward: boolean
  canStepForward: boolean
  currentTime: number
  duration: number
  naturalSize: {
    height: number
    orientation: 'portrait' | 'landscape'
    width: number
  }
}
export interface VideoPlayerProgress {
  currentTime: number
  playableDuration: number
  seekableDuration: number
}
