import {atom, selector} from "recoil";
import {Media} from "../domian";
import {MediaRepository} from '../domian/repositories'


// @ts-ignore
const mediaLoadEffect = () => ({setSelf, onSet}) => {
	const mediaRepository = new MediaRepository();

	onSet(async (newValue: Media[]) => {
		await mediaRepository.write(newValue)
	})
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