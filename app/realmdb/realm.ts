import Realm from "realm"
import { Asset } from "./schemas"

export const RealmDB = async () => {
  return await Realm.open({
    schema: [Asset],
    schemaVersion: 1,
    deleteRealmIfMigrationNeeded:true
  })
}
