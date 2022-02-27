import * as MediaLibrary from "expo-media-library"
import { RealmDB, Types, Schemas } from "../realmdb"

export const addAsset = async (assets: MediaLibrary.Asset[]): Promise<void> => {
  const realm = await RealmDB()
  realm.write(() => {
    assets.forEach((asset) => {
      const newAsset: Types.AssetType = {
        id: asset.id,
        albumId: asset.albumId,
        cid: "",
        creationTime: asset.creationTime,
        duration: asset.duration,
        filename: asset.filename,
        height: asset.height,
        isSynced: false,
        mediaSubtypes: asset.mediaSubtypes,
        mediaType: asset.mediaType,
        modificationTime: asset.modificationTime,
        syncDate: null,
        uri: asset.uri,
        width: asset.width,
      }
      realm.create(Schemas.Asset.name, newAsset)
    })
  })
}
