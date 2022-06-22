import Realm from "realm"
import { Asset, Box, FileRef } from "./schemas"

export const RealmDB = async () => {
  return await Realm.open({
    schema: [Asset, Box, FileRef],
    schemaVersion: 3,
    deleteRealmIfMigrationNeeded: true,
  })
}
