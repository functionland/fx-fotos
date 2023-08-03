import Realm from 'realm'
import { Entities, RealmDB, Schemas } from '../../realmdb'
import { SearchOptionValueType, SyncStatus } from '../../types'
import { FulaFileList } from '../../types/fula'
import { mimeToMediaType } from '../asset-service'
const mime = require('mime-types')

const dynamicFilterGenerator = (
  searchOptions: SearchOptionValueType[],
): string[] => {
  const searchOptionsObj = searchOptions?.reduce<
    Record<string, SearchOptionValueType[]>
  >((obj, option) => {
    if (!obj[option.type]) obj[option.type] = []
    obj[option.type].push(option)
    return obj
  }, {})
  let filterString = []
  Object.keys(searchOptionsObj || {}).map(optionType => {
    let orFilterString = '('
    searchOptionsObj[optionType]?.forEach((option, index) => {
      if (index) orFilterString += ' OR '
      switch (option.type) {
        case 'AssetDateRange':
          orFilterString += ` creationTime <= ${option.value} `
          break
        case 'AssetType':
          orFilterString += ` mediaType == '${option.value}' `
          break
        case 'AssetMime':
          orFilterString += ` mimeType == '${option.value}' `
          break
        case 'AssetDuration':
          orFilterString += ` duration >= ${option.value} `
          break
        default:
          break
      }
    })
    orFilterString += ')'
    filterString.push(orFilterString)
  })
  return filterString
}
export const getAll = (
  params: {
    descriptor?: string
    orderby?: 'asc' | 'desc'
    filter?: string
    filenameFilter?: string | undefined
    uris?: string[] | undefined
    searchOptions?: SearchOptionValueType[]
  } = {},
): Promise<Realm.Results<Entities.AssetEntity & Realm.Object>> =>
  RealmDB()
    .then(realm => {
      const {
        descriptor = 'modificationTime',
        orderby = 'desc',
        filter = 'isDeleted=false or syncStatus=2 or syncStatus=3',
        filenameFilter,
        searchOptions,
        uris = [],
      } = params
      let assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .sorted(descriptor, orderby === 'desc')
      if (filter) assets = assets.filtered(filter)
      if (filenameFilter)
        assets = assets.filtered(
          `filenameNormalized CONTAINS '${filenameFilter.toLowerCase()}'`,
        )

      //Filter assets by uris
      const urisFilter = uris.map(uri => `uri CONTAINS '${uri}'`).join(' OR ')
      if (urisFilter) {
        assets = assets.filtered(urisFilter)
      }

      // filter the query based on search options
      const dynamicFilter = dynamicFilterGenerator(searchOptions)
      dynamicFilter.forEach(filterStr => {
        assets = assets.filtered(filterStr)
      })
      return assets
    })
    .catch(error => {
      console.error('RealmDB getAllAssets error!', error)
      throw error
    })

export const getById = (
  id: string,
): Promise<Realm.Results<Entities.AssetEntity & Realm.Object>> =>
  RealmDB()
    .then(realm => {
      const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .filtered(`id = '${id}'`)
      return assets
    })
    .catch(error => {
      console.error('RealmDB getById error!', error)
      throw error
    })

export const getAllNeedToSync = (): Promise<
  (Entities.AssetEntity & Realm.Object)[]
> =>
  RealmDB()
    .then(realm => {
      const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .filtered('syncStatus=1')
      return assets.slice()
    })
    .catch(error => {
      console.error('RealmDB getAllNeedToSync error!', error)
      throw error
    })

export const getAllNeedToDownload = (): Promise<
  (Entities.AssetEntity & Realm.Object)[]
> =>
  RealmDB()
    .then(realm => {
      const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .filtered('syncStatus=3 and isDeleted=true')
      return assets.slice()
    })
    .catch(error => {
      console.error('RealmDB getAllNeedToDownload error!', error)
      throw error
    })
export const removeAll = (): Promise<void> =>
  RealmDB()
    .then(realm =>
      realm.write(() => {
        const assets = realm.objects<Entities.AssetEntity>(Schemas.Asset.name)

        // Delete all instances of Assets from the realm.
        return realm.delete(assets)
      }),
    )
    .catch(error => {
      console.error('RealmDB removeAll error!', error)
      throw error
    })

export const addOrUpdate = (
  assets: Partial<Entities.AssetEntity>[],
): Promise<Entities.AssetEntity[]> =>
  RealmDB()
    .then(realm => {
      return new Promise<Entities.AssetEntity[]>((resolve, reject) => {
        try {
          const result: Entities.AssetEntity[] = []
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
          console.error('addOrUpdateAssets error!', error)
          reject(error)
        }
      })
    })
    .catch(error => {
      console.error('RealmDB addOrUpdateAssets error!', error)
      throw error
    })

export const markAsSYNC = (assetIds: string[]): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const idsQuery = assetIds.map(id => `id = '${id}'`).join(' OR ')
        const assets = realm
          .objects<Entities.AssetEntity>(Schemas.Asset.name)
          .filtered(`syncStatus=${SyncStatus.NOTSYNCED}`)
          .filtered(idsQuery)
        realm.write(() => {
          for (const asset of assets) {
            asset.syncStatus = SyncStatus.SYNC
          }
        })
      } catch (error) {
        console.error('markAsSYNC error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB markAsSYNC error!', error)
      throw error
    })

export const remove = (assetIds: string[]): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const idsQuery = assetIds.map(id => `id = '${id}'`).join(' OR ')
        const assets = realm
          .objects<Entities.AssetEntity>(Schemas.Asset.name)
          .filtered(idsQuery)
        realm.write(() => {
          for (const asset of assets) asset.isDeleted = true
        })
      } catch (error) {
        console.error('removeAssets error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB removeAssets error!', error)
      throw error
    })

export const removeByUri = (uri: string): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const assets = realm
          .objects<Entities.AssetEntity>(Schemas.Asset.name)
          .filtered(`uri endsWith '${uri}'`)
        realm.write(() => {
          for (const asset of assets) asset.isDeleted = true
        })
      } catch (error) {
        console.error('removeAssets error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB removeAssets error!', error)
      throw error
    })

export const addOrUpdateBackendAssets = (
  backendFiles: FulaFileList,
  currentAssets: Entities.AssetEntity[],
): Promise<Entities.AssetEntity[]> => {
  const assetsObj = currentAssets?.reduce((obj, asset) => {
    if (asset.filenameNormalized) obj[asset.filenameNormalized] = asset
    return obj
  }, {})
  const updateAsset = backendFiles.map<Entities.AssetEntity>(file => {
    if (assetsObj[file.name.toLowerCase()])
      return {
        id: assetsObj[file.name.toLowerCase()].id,
        syncStatus: SyncStatus.Saved,
      }
    else
      return {
        id: new Realm.BSON.UUID().toHexString(),
        filename: file.name,
        filenameNormalized: file.name.toLocaleLowerCase(),
        creationTime: new Date().getTime(), // new Date(file.created),
        modificationTime: new Date().getTime(), // new Date(file.modified),
        mediaType: mimeToMediaType(mime.lookup(file.name)),
        mediaSubtypes: [],
        isDeleted: true,
        syncStatus: SyncStatus.Saved,
      }
  })
  return RealmDB()
    .then(realm => {
      return new Promise<Entities.AssetEntity[]>((resolve, reject) => {
        try {
          const result: Entities.AssetEntity[] = []
          realm.write(() => {
            for (const asset of updateAsset) {
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
          console.error('addOrUpdateBackendAssets error!', error)
          reject(error)
        }
      })
    })
    .catch(error => {
      console.error('RealmDB addOrUpdateBackendAssets error!', error)
      throw error
    })
}
/**
 * Find assets based on cids and make them as Saved
 * @param cids
 * @returns
 */
export const markAsSaved = (cids: string[]): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const idsQuery = cids.map(id => `cid != '${id}'`).join(' and ')
        let assets = realm
          .objects<Entities.AssetEntity>(Schemas.Asset.name)
          .filtered(`syncStatus=${SyncStatus.SYNCED}`)
        if (idsQuery) assets = assets.filtered(idsQuery)
        realm.write(() => {
          for (const asset of assets) {
            asset.syncStatus = SyncStatus.Saved
          }
        })
      } catch (error) {
        console.error('markAsSaved error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB markAsSaved error!', error)
      throw error
    })
