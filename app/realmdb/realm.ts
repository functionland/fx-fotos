import Realm from 'realm'
import { Asset, Box } from './schemas'

export const RealmDB = async () =>
  await Realm.open({
    schema: [Asset, Box],
    schemaVersion: 4,
    deleteRealmIfMigrationNeeded: true,
  })
