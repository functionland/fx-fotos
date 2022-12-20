import Realm from 'realm'
import { Entities, RealmDB, Schemas } from '../../realmdb'

export const getAll = (): Promise<Entities.FolderSettingsEntity[]> =>
  RealmDB()
    .then(realm => {
      const foldersSettings = realm.objects<Entities.FolderSettingsEntity>(
        Schemas.FolderSettings.name,
      )
      return foldersSettings.slice()
    })
    .catch(error => {
      console.error('RealmDB getAll FolderSettings error!', error)
      throw error
    })

export const getAllAutoBackups = (): Promise<Entities.FolderSettingsEntity[]> =>
  RealmDB()
    .then(realm => {
      const foldersSettings = realm.objects<Entities.FolderSettingsEntity>(
        Schemas.FolderSettings.name,
      )
      return foldersSettings.filtered('autoBackup=true').slice()
    })
    .catch(error => {
      console.error('RealmDB getAll FolderSettings error!', error)
      throw error
    })

export const get = (
  name: string,
): Promise<Entities.FolderSettingsEntity | undefined> =>
  RealmDB()
    .then(realm => {
      const foldersSettings = realm
        .objects<Entities.FolderSettingsEntity>(Schemas.FolderSettings.name)
        .filtered(`name='${name}'`)
      return foldersSettings.slice()?.[0]
    })
    .catch(error => {
      console.error('RealmDB get FolderSettings error!', error)
      throw error
    })
export const removeAll = (): Promise<void> =>
  RealmDB()
    .then(realm =>
      realm.write(() => {
        const folders = realm.objects<Entities.FolderSettingsEntity>(
          Schemas.FolderSettings.name,
        )

        // Delete all instances of FolderSettins from the realm.
        return realm.delete(folders)
      }),
    )
    .catch(error => {
      console.error('RealmDB removeAll FolderSettings error!', error)
      throw error
    })

export const addOrUpdate = (
  folders: Entities.FolderSettingsEntity[],
): Promise<Entities.FolderSettingsEntity[]> =>
  RealmDB()
    .then(realm => {
      try {
        const result = []
        return realm.write(() => {
          for (const folder of folders) {
            result.push(
              realm.create<Entities.FolderSettingsEntity>(
                Schemas.FolderSettings.name,
                {
                  ...folder,
                },
                Realm.UpdateMode.Modified,
              ),
            )
          }
          return result
        })
      } catch (error) {
        console.error('addOrUpdate FolderSettings error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB addOrUpdate FolderSettings error!', error)
      throw error
    })

export const remove = (names: string[]): Promise<void> =>
  RealmDB()
    .then(realm => {
      try {
        const idsQuery = names.map(name => `name = '${name}'`).join(' OR ')
        const folders = realm
          .objects<Entities.FolderSettingsEntity>(Schemas.FolderSettings.name)
          .filtered(idsQuery)
        realm.write(() => {
          realm.delete(folders)
        })
      } catch (error) {
        console.error('remove FolderSettings error!', error)
        throw error
      }
    })
    .catch(error => {
      console.error('RealmDB remove FolderSettings error!', error)
      throw error
    })
