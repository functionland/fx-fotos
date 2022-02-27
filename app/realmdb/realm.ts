import Realm from "realm"
import { Asset, SyncTable } from "./schemas"

export const RealmDB = async () => {
  return await Realm.open({
    schema: [Asset, SyncTable],
    schemaVersion: 1,
  })
}
