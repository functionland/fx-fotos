export const Asset = {
  name: "Asset",
  primaryKey: "id",
  properties: {
    id: "string",
    /**
     * Filename of the asset.
     */
    filename: "string?",
    /**
     * URI that points to the asset. `assets://*` (iOS), `file://*` (Android)
     */
    uri: "string?",
    /**
     * Media type.
     */
    mediaType: "string?",
    /**
     * __iOS Only.__ An array of media subtypes.
     */
    mediaSubtypes: "string?",
    /**
     * Width of the image or video.
     */
    width: "int?",
    /**
     * Height of the image or video.
     */
    height: "int?",
    /**
     * File creation timestamp.
     */
    creationTime: "int?",
    /**
     * Last modification timestamp.
     */
    modificationTime: "int?",
    /**
     * Duration of the video or audio asset in seconds.
     */
    duration: "int?",
    /**
     * __Android Only.__ Album ID that the asset belongs to.
     */
    albumId: "string?",
    /**
     * Sync statis with box
     */
    isSynced:  { type: "bool", default: false },
    /**
     * Sync date with box
     */
    syncDate: "date?",
    /**
     * content id in the box
     */
    cid: "string?",
    /**
     * Deleted form storage
     */
    isDeleted:{ type: "bool", default: false },
  },
}
