import { Entities, RealmDB, Schemas } from "../../realmdb"

export const getAll = (
  descriptor = "modificationTime",
  orderby: "asc" | "desc" = "desc",
): Promise<Realm.Results<Entities.AssetEntity & Realm.Object>> => {
  return RealmDB()
    .then((realm) => {
      const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .sorted(descriptor, orderby === "desc")
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
                    ...asset,
                  },
                  Realm.UpdateMode.Modified,
                ),
              )
            }
            resolve(result)
          })
        } catch (error) {
          console.error("addOrUpdateAssets error!", error)
          reject(error)
        }
      })
    })
    .catch((error) => {
      console.error("RealmDB addOrUpdateAssets error!", error)
      throw error
    })
}
