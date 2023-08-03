import { DefaultValue, atom } from 'recoil'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BoxEntity, FolderSettingsEntity } from '../realmdb/entities'
import {
  Asset,
  RecyclerAssetListSection,
  Library,
  AssetStory,
  AppPreferences,
} from '../types'
import * as KeyChain from '../utils/keychain'

const localForageEffect =
  (key: string) =>
  async ({ setSelf, onSet }) => {
    const savedValue = await AsyncStorage.getItem(key)

    if (savedValue != null) {
      setSelf(JSON.parse(savedValue))
    }

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, oldValue, isReset) => {
      isReset
        ? AsyncStorage.removeItem(key)
        : AsyncStorage.setItem(
            key,
            JSON.stringify({ ...oldValue, ...newValue }),
          ).catch(error => console.log('localForageEffect onSet error:', error))
    })
  }

export const mediasState = atom<Asset[]>({
  key: 'mediasState',
  default: [],
})
export const singleAssetState = atom<Asset>({
  key: 'singleAssetState',
  default: null,
})
export const recyclerSectionsState = atom<RecyclerAssetListSection[]>({
  key: 'recyclerSectionsState',
  default: null,
})

export const selectedLibraryState = atom<Library>({
  key: 'selectedLibraryState',
  default: null,
})
export const selectedStoryState = atom<AssetStory>({
  key: 'selectedStoryState',
  default: null,
})
export const boxsState = atom<BoxEntity[]>({
  key: 'boxsState',
  default: null,
})
export const foldersSettingsState = atom<Record<string, FolderSettingsEntity>>({
  key: 'foldersSettings',
  default: {},
})
export const dIDCredentialsState = atom<KeyChain.UserCredentials>({
  key: 'dIDCredentials',
  default: null,
})

export const fulaPeerIdState = atom<KeyChain.UserCredentials>({
  key: 'fulaPeerIdState',
  default: null,
})

export const fulaIsReadyState = atom<boolean>({
  key: 'fulaIsReadyState',
  default: false,
})

export const appPreferencesState = atom<AppPreferences>({
  key: 'appPreferencesState',
  default: {
    firstTimeBackendSynced: false,
  },
  effects: [localForageEffect('appPreferencesState')],
})
