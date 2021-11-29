import {atom} from "recoil";
import {Media} from "../../types/interfaces";

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