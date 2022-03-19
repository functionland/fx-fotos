import { Entities, RealmDB, Schemas } from "../../realmdb"

export const getById = (id: number): Promise<Entities.SyncTableEntity> => {
  return RealmDB()
    .then((realm) => {
      const syncItems = realm
        .objects<Entities.SyncTableEntity>(Schemas.SyncTable.name)
        .filtered(`id = ${id}`)
        .map((item) => ({ ...item }))
      return syncItems?.[0]
    })
    .catch((error) => {
      console.error("RealmDB getById syncTable error!", error)
      throw error
    })
}

export const addOrUpdate = (
  syncTables: Entities.SyncTableEntity[],
): Promise<Entities.SyncTableEntity> => {
  return RealmDB()
    .then((realm) => {
      return new Promise((resolve, reject) => {
        try {
          const result = []
          realm.write(() => {
            for (const item of syncTables) {
              result.push(
                realm.create<Entities.SyncTableEntity>(
                  Schemas.SyncTable.name,
                  {
                    ...item,
                  },
                  "modified",
                ),
              )
            }
            resolve(result)
          })
        } catch (error) {
          console.error("sycnTable addOrUpdate error!", error)
          reject(error)
        }
      })
    })
    .catch((error) => {
      console.error("RealmDB addOrUpdate SyncTable error!", error)
      throw error
    })
}
