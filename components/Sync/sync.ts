import {atom, selector} from "recoil";
import {Media} from "../../domian";
import {mediasState} from "../../states";
import {MediaType} from "expo-media-library";

export const uploadListState = selector<Media[]>({
	key: 'uploadListState',
	get: ({get}) => {
		return get(mediasState).filter(media => !media.hasCid && media.mediaType === MediaType.photo)
	}
})


export const downloadListState = selector<Media[]>({
	key: 'downloadListState',
	get: ({get}) => {
		return get(mediasState).filter(media => media.hasCid && !media.uri)
	}
})