import {atom, selector} from "recoil";
import {Media} from "../types/interfaces";
import {MediaRepository} from '../repositories/MediaRepository'


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
