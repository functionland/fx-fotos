import { atom } from "recoil"
import { Asset } from "expo-media-library"
import { FlatSection, story, album } from "../types/interfaces"
import { DataProvider } from "fula-recyclerlistview"

export const photosState = atom<Array<Asset>>({
  key: "photosState",
  default: [],
})

export const numColumnsState = atom<2 | 3 | 4>({
  key: "numColumnsState",
  default: 3,
})

export const mediasState = atom<Asset[]>({
  key: "mediasState",
  default: [],
})

export const preparedMediaState = atom<FlatSection>({
  key: "preparedMediaState",
  default: { layout: [], headerIndexes: [], stories: [], lastTimestamp: 0 },
})

export const storiesState = atom<story[]>({
  key: "storiesState",
  default: [],
})

export const storyState = atom<story | undefined>({
  key: "storyState",
  default: undefined,
})

export const singlePhotoIndexState = atom<number>({
  key: "singlePhotoIndexState",
  default: 1,
})

export const imagePositionState = atom<{ x: number; y: number }>({
  key: "imagePositionState",
  default: { x: 0, y: 0 },
})

export const dataProviderState = atom<DataProvider>({
  key: "dataProviderState",
  default: new DataProvider((r1, r2) => {
    return r1.id !== r2.id || r1.deleted !== r2.deleted
  }),
})

export const identityState = atom<any>({
  key: "identityState",
  default: null,
})

export const contactsState = atom<Array<{ id: string }>>({
  key: "contactsState",
  default: [],
})

export const albumsState = atom<Array<album>>({
  key: "albumsState",
  default: [],
})
