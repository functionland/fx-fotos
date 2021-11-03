import {atom, selector} from "recoil";
import {Media} from "../domian";
import {mediasState} from "./index";

export const uploadListState = selector<Media[]>({
	key: 'uploadListState',
	get: ({get}) => {
		return get(mediasState).filter(media => !media.hasCid)
	}
})


export const downloadListState = selector<Media[]>({
	key: 'downloadListState',
	get: ({get}) => {
		return get(mediasState).filter(media => media.hasCid && !media.uri)
	}
})