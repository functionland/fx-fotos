import * as MediaLibrary from "expo-media-library";
import {Asset} from "expo-media-library";
import {Media} from "./index";
import {AsyncStorage} from "react-native";
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';
import {PhotoHeight} from "../components/Photos/Constants";

export class MediaRepository {
	constructor() {
	}
	
	async * getIterable():AsyncIterable<Media[]>{
		const gen = asyncMerge()
		while (true){
			const {done,value} = await gen.next()
			if(done){
				console.log("get all done")
				break;
			}
			yield(value)
		}
	}

	async getAll(): Promise<Media[]> {
		const gen = asyncMerge()
		let all=[];
		while (true){
			const {done,value} = await gen.next()
			if(done){
				console.log("get all done")
				break;
			}
			all.push(...value)
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
			sortBy: [MediaLibrary.SortBy.creationTime],
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
		try{
			assetPage = await getStorageCursor(100, after)
			yield assetPage.assets
			flag += assetPage.assets.length
			after = assetPage.endCursor
		}catch (e) {
			break;
		}

	}
	while (assetPage.hasNextPage && size > flag)

}

async function* asyncMerge(): AsyncIterable<Media[]> {
	let medias = await getMedias()
	let Hashmap = new Map<string, number>()
	for (const [index, media] of medias.entries()) {
		Hashmap.set(media.id, index)
	}
	const gen = getLocalAssets('',99999999)
	while (true){
		const {done, value} = await gen.next()
		if(done){
			console.log("get Local asset done")
			break;
		}
		let merged = []
		for (const asset of value) {
			if(!asset.uri||!asset.uri.includes('DCIM')){
				continue;
			}
			if (Hashmap.has(asset.id)) {
				merged.push({...asset, ...medias[Hashmap.get(asset.id) as number]})
			} else {
				let thumbnail = null;
				if (asset.mediaType === 'photo'&& asset.uri)
					thumbnail = await manipulateAsync(asset.uri, [{'resize': {height: PhotoHeight}}], {
						compress: 1,
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