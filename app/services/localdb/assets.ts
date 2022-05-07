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
          return result
        })
      } catch (error) {
        console.error("addOrUpdateAssets error!", error)
        throw error
      } 
    })
    .catch((error) => {
      console.error("RealmDB addOrUpdateAssets error!", error)
      throw error
    })
}

export const remove = (assetIds: string[]): Promise<void> => {
  return RealmDB()
    .then((realm) => {
      try {
        const idsQuery = assetIds.map(id => `id = '${id}'`).join(' OR ');
        const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .filtered(idsQuery)
        realm.write(() => {
          realm.delete(assets)
        });
      } catch (error) {
        console.error("removeAssets error!", error)
        throw error
      } 
    })
    .catch((error) => {
      console.error("RealmDB removeAssets error!", error)
      throw error
    })
}

export const removeByUri = (uri:string): Promise<void> => {
  return RealmDB()
    .then((realm) => {
      try {
        const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .filtered(`uri endsWith '${uri}'`)
        console.log("removeByUri",assets.length)
        realm.write(() => {
          realm.delete(assets)
        });
      } catch (error) {
        console.error("removeAssets error!", error)
        throw error
      } 
    })
    .catch((error) => {
      console.error("RealmDB removeAssets error!", error)
      throw error
    })
}
