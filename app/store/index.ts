import { atom } from "recoil"
import { Asset,RecyclerAssetListSection } from "../types"

export const mediasState = atom<Asset[]>({
  key: "mediasState",
  default: [],
})

export const recyclerSectionsState = atom<RecyclerAssetListSection[]>({
  key: "recyclerSectionsState",
  default: null,
})
