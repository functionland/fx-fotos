import * as MediaLibrary from "expo-media-library";
import {Asset} from "expo-media-library";
import {Media} from "./index";
import {AsyncStorage} from "react-native";
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';
import {PhotoHeight} from "../components/Photos/Constants";


interface MediaResponse {
	type: 'new' | 'cache' | 'old',
	medias: Media[]
}

export class MediaRepository {
	constructor() {
	}

	async* getIterable(): AsyncIterable<MediaResponse> {
		if(await getLock()){
			throw Error('Media Locked')
		}
		await setLock(true)
		const gen = asyncMerge()
		while (true) {
			// @ts-ignore
			const {done, value} = await gen.next()
			if (done) {
				break;
			}
			yield(value)
		}
		await setLock(false)
	}

	async write(medias: Media[]) {
		await setMedias(medias)
	}
}

async function* getExternalAssets(options?: MediaLibrary.AssetsOptions, size = 999999): AsyncIterable<Asset[]> {
	let assetOptions: MediaLibrary.AssetsOptions = {
		first: 20,
		mediaType: [
			MediaLibrary.MediaType.photo,
			MediaLibrary.MediaType.video,
		],
		sortBy: [MediaLibrary.SortBy.creationTime, MediaLibrary.SortBy.creationTime],
		...options
	}
	let assetPage
	let flag = 0
	do {
		try {
			assetPage = await MediaLibrary.getAssetsAsync(assetOptions)
			yield assetPage.assets
			flag += assetPage.assets.length
			assetOptions.after = assetPage.endCursor
		} catch (e) {
			break;
		}

	}
	while (assetPage.hasNextPage && size > flag)

}

async function* asyncMerge(): AsyncIterable<MediaResponse> {
	let medias: Media[] = (await getMedias()).sort(
		function (a:Media, b:Media) {
			// @ts-ignore
			return new Date(b.creationTime||b.modificationTime) - new Date(a.creationTime||a.modificationTime);
		}
	)
	let Hashmap = new Map<string, number>()
	for (const [index, media] of medias.entries()) {
		Hashmap.set(media.id, index)
	}
	if (medias.length > 1) {
		yield {type: "cache", medias}
		for (const item of [0, medias.length - 1]) {
			const newItemIterable = getExternalAssets({[item === 0 ? 'createdAfter' : 'createdBefore']: medias[item].creationTime || medias[item].modificationTime})
			while (true) {
				// @ts-ignore
				const {done, value} = await newItemIterable.next()
				if (done) {
					break;
				}
				let newMedias: Media[] = []
				for (const asset of value) {
					if (!asset.uri || !asset.uri.includes('DCIM') || Hashmap.has(asset.id)) {
						continue;
					}
					let thumbnail = null;
					if (asset.mediaType === 'photo' && asset.uri)
						thumbnail = await manipulateAsync(asset.uri, [{'resize': {height: PhotoHeight}}], {
							compress: 1,
							format: SaveFormat.PNG
						})
					newMedias.push({...asset, cid: '', hasCid: false, preview: thumbnail ? thumbnail.uri : ''})
				}
				yield {type: item === 0 ? 'new' : 'old', medias: newMedias}
			}
		}


	} else {
		const gen = getExternalAssets()
		while (true) {
			// @ts-ignore
			const {done, value} = await gen.next()
			if (done) {
				break;
			}
			let merged = []
			for (const asset of value) {
				if (!asset.uri || !asset.uri.includes('DCIM')) {
					continue;
				}
				if (Hashmap.has(asset.id)) {
					merged.push({...asset, ...medias[Hashmap.get(asset.id) as number]})
				} else {
					let thumbnail = null;
					if (asset.mediaType === 'photo' && asset.uri)
						thumbnail = await manipulateAsync(asset.uri, [{'resize': {height: PhotoHeight}}], {
							compress: 1,
							format: SaveFormat.PNG
						})
					merged.push({...asset, cid: '', hasCid: false, preview: thumbnail ? thumbnail.uri : ''})
				}

			}
			yield {type: 'old', medias: merged}
		}
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

const setLock = async (value:boolean)=>{
	try {
		await AsyncStorage.setItem('mediaLock', JSON.stringify(value))
	} catch (e) {
		console.log(e)
	}
}

const getLock = async () => {
	try {
		const jsonValue = await AsyncStorage.getItem('mediaLock')
		return jsonValue != null ? JSON.parse(jsonValue) : false;
	} catch (e) {
		console.log(e)
	}
}