import {atom, selector} from "recoil";
import {Media} from "../../domian";
import {mediasState} from "../../states";

export const uploadListState = atom<Media[]>({
	key: 'uploadListState',
	default:[]
})


// export const downloadListState = selector<Media[]>({
// 	key: 'downloadListState',
// 	get: ({get}) => {
// 		return get(mediasState).filter(media => media.hasCid && !media.uri)
// 	}
// })