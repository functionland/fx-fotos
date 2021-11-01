import {atom, selector} from "recoil";
import {Media} from "../domian";
import * as MediaLibrary from "expo-media-library";
import {AsyncStorage} from "react-native";
import {Asset} from "expo-media-library";


// @ts-ignore
const mediaLoadEffect = () => ({setSelf, onSet}) => {
	(async () => {
		const medias = await refreshMedias();
		if (medias) {
			setSelf(medias);
		}
	})()

	onSet(async (newValue: Media[]) => {
		await setMedias(newValue)
	})
}

async function getLocalAssets(assets: Array<Asset> = [], after: string = ''): Promise<Array<Asset>> {
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
	const asset = await getStorageCursor(9999999, after)
	asset.assets.map((value) => {
		_assets.push(value)
	})
	if (asset.hasNextPage) {
		return await getLocalAssets(_assets, asset.endCursor)
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
			_assets = _assets.filter((value) => value.id === media.id)
		} else {
			merged.push({...media, uri: null})
		}
	}
	for (const asset of _assets) {
		merged.push({...asset, cid: '', hasCid: false})
	}
	return merged
}


const getMedias = async () => {
	try {
		const jsonValue = await AsyncStorage.getItem('medias')
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		console.log(e)
	}
}

const refreshMedias = async () => {
	let assets = await getLocalAssets();
	let medias = await getMedias()
	return await asyncMerge(assets, medias)
}

const setMedias = async (value: Media[]) => {
	try {
		await AsyncStorage.setItem('medias', JSON.stringify(value))
	} catch (e) {
		console.log(e)
	}
}


export const mediasState = atom<Media[]>({
	key: 'mediasState',
	default: [],
	effects_UNSTABLE: [
		mediaLoadEffect()
	]
});

// const getAllMedias = selector({
// 	key: 'Medias',
// 	get: async ({get}) => {
// 		// let media = await getStorageMedia()
// 	}
// })