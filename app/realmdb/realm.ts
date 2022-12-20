import Realm from 'realm'
import { Asset, Box, AssetLocation, FolderSettings } from './schemas'

export const RealmDB = async () =>
  await Realm.open({
    schema: [Asset, Box, AssetLocation, FolderSettings],
    schemaVersion: 8,
    deleteRealmIfMigrationNeeded: true,
  })
