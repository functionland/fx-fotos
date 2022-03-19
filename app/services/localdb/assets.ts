import { Entities, RealmDB, Schemas } from "../../realmdb"

export const getAll = (orderby: "asc" | "desc" = "desc"): Promise<Entities.AssetEntity[]> => {
  return RealmDB()
    .then((realm) => {
      const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .sorted("creationTime", orderby === "desc")
        .map((asset) => ({ ...asset }))
      return assets
    })
    .catch((error) => {
      console.error("RealmDB getAllAssets error!", error)
      throw error
    })
}

export const addOrUpdate = (assets: Entities.AssetEntity[]): Promise<Entities.AssetEntity[]> => {
  return RealmDB()
    .then((realm) => {
      return new Promise((resolve, reject) => {
        try {
          const result = []
          realm.write(() => {
            for (const asset of assets) {
              result.push(
                realm.create<Entities.AssetEntity>(
                  Schemas.Asset.name,
                  {
                    isSynced: false,
                    ...asset,
                  },
                  Realm.UpdateMode.Modified,
                ),
              )
            }
            resolve(result)
          })
        } catch (error) {
          console.error("addOrUpdate error!", error)
          reject(error)
        }
      })
    })
    .catch((error) => {
      console.error("RealmDB addOrUpdateAssets error!", error)
      throw error
    })
}
