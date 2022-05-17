import { atom } from "recoil"
import { Asset, RecyclerAssetListSection, Library } from "../types"

export const mediasState = atom<Asset[]>({
  key: "mediasState",
  default: [],
})

export const recyclerSectionsState = atom<RecyclerAssetListSection[]>({
  key: "recyclerSectionsState",
  default: null,
})

export const selectedLibraryState = atom<Library>({
  key: "selectedLibraryState",
  default: null,
})