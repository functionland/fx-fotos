export const Asset = {
  name: 'Asset',
  primaryKey: 'id',
  properties: {
    id: 'string',
    /**
     * Filename of the asset.
     */
    filename: 'string?',
    /**
     * Lowercase of filename for search
     */
    filenameNormalized: 'string?',
    /**
     * file size of asset
     */
    fileSize: 'float?',
    /**
     * URI that points to the asset. `assets://*` (iOS), `file://*` (Android)
     */
    uri: 'string?',
    /**
     * Media type.
     */
    mediaType: 'string?',
    /**
     * __iOS Only.__ An array of media subtypes.
     */
    mediaSubtypes: 'string?[]',
    /**
     * Width of the image or video.
     */
    width: 'int?',
    /**
     * Height of the image or video.
     */
    height: 'int?',
    /**
     * File creation timestamp.
     */
    creationTime: 'int?',
    /**
     * Last modification timestamp.
     */
    modificationTime: 'int?',
    /**
     * Duration of the video or audio asset in seconds.
     */
    duration: 'int?',
    /**
     * __Android Only.__ Album ID that the asset belongs to.
     */
    albumId: 'string?',
    /**
     * Sync statis with box
     */
    syncStatus: { type: 'int', default: 0 },
    /**
     * Sync date with box
     */
    syncDate: 'date?',
    /**
     * content id in the box
     */
    cid: 'string?',
    /**
     * When an asset stored in the box by encryption we generate jwe to able to decrypt asset in the future
     */
    jwe: 'string?', // Embed a single object
    /**
     * Deleted form storage
     */
    isDeleted: { type: 'bool', default: false },
    /**
     * Asset location metadata
     */
    location: 'AssetLocation?',
    /**
     * whenever asset metadata sync is done it would be true
     */
    metadataIsSynced: { type: 'bool', default: false },
    /**
     * asset MIME type
     */
    mimeType: 'string?',
  },
}
export const AssetLocation = {
  name: 'AssetLocation',
  embedded: true,
  properties: {
    latitude: 'float?',
    longitude: 'float?',
    altitude: 'float?',
    heading: 'float?',
    speed: 'float?',
  },
}
