import Realm from 'realm'
import { Entities, RealmDB, Schemas } from '../../realmdb'
import { SearchOptionValueType, SyncStatus } from '../../types'

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
    descriptor: string
    orderby: 'asc' | 'desc'
    filter: string
    filenameFilter: string | undefined
    searchOptions?: SearchOptionValueType[]
  } = {},
): Promise<Realm.Results<Entities.AssetEntity & Realm.Object>> =>
  RealmDB()
    .then(realm => {
      const {
        descriptor = 'modificationTime',
        orderby = 'desc',
        filter = 'isDeleted=false or syncStatus=2',
        filenameFilter,
        searchOptions,
      } = params
      let assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .sorted(descriptor, orderby === 'desc')
      if (filter) assets = assets.filtered(filter)
      if (filenameFilter)
        assets = assets.filtered(
          `filenameNormalized CONTAINS '${filenameFilter.toLowerCase()}'`,
        )

      // filter the query based on search options
      const dynamicFilter = dynamicFilterGenerator(searchOptions)
      console.log('dynamicFilter', dynamicFilter)
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
  Realm.Results<Entities.AssetEntity & Realm.Object>
> =>
  RealmDB()
    .then(realm => {
      const assets = realm
        .objects<Entities.AssetEntity>(Schemas.Asset.name)
        .filtered('syncStatus=1')
      return assets
    })
    .catch(error => {
      console.error('RealmDB getAllAssets error!', error)
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
  assets: Entities.AssetEntity[],
): Promise<Entities.AssetEntity[]> =>
  RealmDB()
    .then(realm => {
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
        console.error('addOrUpdateAssets error!', error)
        throw error
      }
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
