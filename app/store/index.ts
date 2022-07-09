import { atom } from "recoil"
import { BoxEntity } from "../realmdb/entities"
import { Asset, RecyclerAssetListSection, Library } from "../types"

export const mediasState = atom<Asset[]>({
  key: "mediasState",
  default: [],
})
export const singleAssetState = atom<Asset>({
  key: "singleAssetState",
  default: null,
})
export const recyclerSectionsState = atom<RecyclerAssetListSection[]>({
  key: "recyclerSectionsState",
  default: null,
})

export const selectedLibraryState = atom<Library>({
  key: "selectedLibraryState",
  default: null,
})

export const boxsState = atom<BoxEntity[]>({
  key: "boxsState",
  default: null,
})