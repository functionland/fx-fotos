import * as MediaLibrary from "expo-media-library";
import {Asset} from "expo-media-library";
import {Media} from "./index";
import {AsyncStorage} from "react-native";
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';

export class MediaRepository {
	constructor() {
	}
	async getAll(): Promise<Media[]> {
		const media = await refreshMedias()
		return media as Media[]
	}
	async write(medias: Media[]) {
		await setMedias(medias)
	}
}

async function getLocalAssets(assets: Array<Asset> = [], after: string = '',size=9999999999): Promise<Array<Asset>> {
	const getStorageCursor = (
		limit: number = 99999999999999,
		after: string = '',
		createdBefore: Date | number | undefined = undefined,
		createdAfter: Date | number | undefined = undefined,
		mediaType: Array<any> = [
			MediaLibrary.MediaType.photo,
			MediaLibrary.MediaType.video,
		],
	) => {
		let mediaFilter: MediaLibrary.AssetsOptions = {
			mediaType: mediaType,
			sortBy: [MediaLibrary.SortBy.modificationTime],
		};
		if (limit) {
			mediaFilter.first = limit;
		} else {
			mediaFilter.first = 9999999999999999;
		}
		if (after) {
			mediaFilter.after = after;
		}
		if (createdAfter) {
			mediaFilter.createdAfter = createdAfter;
		}
		if (createdBefore) {
			mediaFilter.createdBefore = createdBefore;
		}

		return MediaLibrary.getAssetsAsync(mediaFilter);
	};
	let _assets = assets ? assets : []
	const asset = await getStorageCursor(999999999, after)
	console.log("is asset comming")
	asset.assets.map((value) => {
		_assets.push(value)
	})
	if(size && _assets.length>=size){
		return _assets
	}
	if (asset.hasNextPage) {
		return await getLocalAssets(_assets, asset.endCursor,999999999)
	}
	return _assets
}

async function asyncMerge(assets: Asset[], medias: Media[]) {
	let merged = []
	let _assets = assets
	for (const media of medias) {
		const asset = _assets.find((value) => value.id === media.id)
		if (asset) {
			merged.push({...media, ...asset})
			_assets = _assets.filter((value) => value.id !== media.id)
		} else {
			if(media.hasCid)
				merged.push({...media, uri: null})
		}
	}
	for (const asset of _assets) {
		let thumbnail = null;
		// if(asset.mediaType==='photo')
			// thumbnail = await manipulateAsync(asset.uri,[{'resize':{width:300,height:300}}],{compress:0,format:SaveFormat.PNG})
		// console.log(thumbnail?.uri)
		merged.push({...asset, cid: '', hasCid: false,preview:''})
	}
	return merged as Media[]
}


const getMedias = async () => {
	try {
		const jsonValue = await AsyncStorage.getItem('medias')
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		console.log(e)
	}
}

export const refreshMedias = async () => {
	let assets = await getLocalAssets();
	let medias = await getMedias()
	const merged = await asyncMerge(assets, medias)
	merged.sort((a,b)=>b.creationTime-a.creationTime)
	await setMedias(merged)
	return merged
}

export const setMedias = async (value: Media[]) => {
	try {
		await AsyncStorage.setItem('medias', JSON.stringify(value))
	} catch (e) {
		console.log(e)
	}
}