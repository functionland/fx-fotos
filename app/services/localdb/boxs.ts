import Realm from 'realm'
import { Entities, RealmDB, Schemas } from '../../realmdb'

const { UUID } = Realm.BSON
export const getAll = (): Promise<
  Realm.Results<Entities.BoxEntity & Realm.Object>
> =>
  RealmDB()
    .then(realm => {
      const boxs = realm.objects<Entities.BoxEntity>(Schemas.Box.name)
      return boxs
    })
    .catch(error => {
      console.error('RealmDB getAll Boxs error!', error)
      throw error
    })

export const removeAll = (): Promise<void> =>
  RealmDB()
    .then(realm =>
      realm.write(() => {
        const boxs = realm.objects<Entities.BoxEntity>(Schemas.Box.name)

        // Delete all instances of Assets from the realm.
        return realm.delete(boxs)
      }),
    )
    .catch(error => {
      console.error('RealmDB removeAll Boxs error!', error)
      throw error
    })

export const addOrUpdate = (
  boxs: Entities.BoxEntity[],
): Promise<Entities.BoxEntity[]> =>
  RealmDB()
    .then(realm => {
      try {
        const result = []
        realm.write(() => {
          for (const box of boxs) {
            result.push(
              realm.create<Entities.BoxEntity>(
                Schemas.Box.name,
                {
                  ...box,
                  id: box.id ?? new UUID().toHexString(),
                },
                Realm.UpdateMode.Modified,
              ),
            )
          }
          return result
        })
      } catch (error) {
        console.error('addOrUpdate Box error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB addOrUpdateAssets error!', error)
      throw error
    })

export const remove = (ids: string[]): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const idsQuery = ids.map(id => `id = '${id}'`).join(' OR ')
        const boxs = realm
          .objects<Entities.BoxEntity>(Schemas.Box.name)
          .filtered(idsQuery)
        realm.write(() => {
          realm.delete(boxs)
        })
      } catch (error) {
        console.error('remove Boxs error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB remove Boxs error!', error)
      throw error
    })

export const removeByAddress = (address: string): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const boxs = realm
          .objects<Entities.BoxEntity>(Schemas.Box.name)
          .filtered(`address endsWith '${address}'`)
        realm.write(() => {
          realm.delete(boxs)
        })
      } catch (error) {
        console.error('removeByAddress box error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB removeByAddress box error!', error)
      throw error
    })
