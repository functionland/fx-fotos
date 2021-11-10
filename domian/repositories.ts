import * as MediaLibrary from "expo-media-library";
import {Asset} from "expo-media-library";
import {Media} from "./index";
import {AsyncStorage} from "react-native";
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';

export class MediaRepository {
	constructor() {
	}
	
	async * getIterable():AsyncIterable<Media[]>{
		const gen = asyncMerge()
		while (!gen.done){
			yield (await gen.next()).value
		}
	}

	async getAll(): Promise<Media[]> {
		const gen = asyncMerge()
		let all=[];
		while (!gen.done){
			all.push((await gen.next()).value)
		}
		return  all
	}

	async write(medias: Media[]) {
		await setMedias(medias)
	}
}

async function* getLocalAssets(after: string = '', size = 9999999999): AsyncIterable<Asset[]> {
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
	let assetPage
	let flag = 0
	do {
		assetPage = await getStorageCursor(100, after)
		yield assetPage.assets
		console.log(assetPage.hasNextPage)
		console.log("asdfjakdsfjlaksjdflasjkdfhas;kdfl")
		flag += assetPage.assets.length
		after = assetPage.endCursor
	}
	while (assetPage.hasNextPage && size > flag)

}

async function* asyncMerge(): AsyncIterable<Media[]> {
	let medias = await getMedias()
	let Hashmap = new Map<string, number>()
	for (const [index, media] of medias.entries()) {
		Hashmap.set(media.id, index)
	}
	const gen = getLocalAssets()
	while (!gen.done){
		let merged = []
		const assets = (await gen.next()).value
		for (const asset of assets) {
			if (Hashmap.has(asset.id)) {
				merged.push({...asset, ...medias[Hashmap.get(asset.id) as number]})
			} else {
				let thumbnail = null;
				if (asset.mediaType === 'photo')
					thumbnail = await manipulateAsync(asset.uri, [{'resize': {width: 300, height: 300}}], {
						compress: 0,
						format: SaveFormat.PNG
					})
				// console.log(thumbnail?.uri)
				merged.push({...asset, cid: '', hasCid: false, preview: thumbnail ? thumbnail.uri : ''})
			}

		}
		yield merged
	}
}


const getMedias = async () => {
	try {
		const jsonValue = await AsyncStorage.getItem('medias')
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		console.log(e)
	}
}

export const setMedias = async (value: Media[]) => {
	try {
		await AsyncStorage.setItem('medias', JSON.stringify(value))
	} catch (e) {
		console.log(e)
	}
}