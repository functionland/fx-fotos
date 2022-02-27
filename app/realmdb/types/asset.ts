export type AssetType = {
  id: string
  /**
   * Filename of the asset.
   */
  filename: string | undefined
  /**
   * URI that points to the asset. `assets://*` (iOS), `file://*` (Android)
   */
  uri: string | undefined
  /**
   * Media type.
   */
  mediaType: string | undefined
  /**
   * __iOS Only.__ An array of media subtypes.
   */
  mediaSubtypes: string | undefined
  /**
   * Width of the image or video.
   */
  width: number | undefined
  /**
   * Height of the image or video.
   */
  height: number | undefined
  /**
   * File creation timestamp.
   */
  creationTime: number | undefined
  /**
   * Last modification timestamp.
   */
  modificationTime: number | undefined
  /**
   * Duration of the video or audio asset in seconds.
   */
  duration: number | undefined
  /**
   * __Android Only.__ Album ID that the asset belongs to.
   */
  albumId: string | undefined
  /**
   * Sync statis with box
   */
  isSynced: boolean
  /**
   * Sync date with box
   */
  syncDate: Date | undefined
  /**
   * content id in the box
   */
  cid: string | undefined
}
