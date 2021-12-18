import { Asset as ExpoAsset } from "expo-media-library"

export type Asset = ExpoAsset & {

}
export type AssetStory={
    id:string;
    data:Asset[];
    title: string | undefined;
}
export type RecyclerAssetListSectionData = AssetStory[] | Asset | string