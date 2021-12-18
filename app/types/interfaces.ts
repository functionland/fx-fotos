import { ViewType, RecyclerAssetListSectionData } from "./index"

export interface RecyclerAssetListSection {
  id:string;
  data: RecyclerAssetListSectionData;
  type: ViewType;
}
