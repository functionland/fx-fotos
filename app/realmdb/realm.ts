import Realm from 'realm'
import { Asset, Box, AssetLocation } from './schemas'

export const RealmDB = async () =>
  await Realm.open({
    schema: [Asset, Box, AssetLocation],
    schemaVersion: 7,
    deleteRealmIfMigrationNeeded: true,
  })
