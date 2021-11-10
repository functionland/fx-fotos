import {atom} from "recoil";

export const HeaderVisibilityState = atom<boolean>({
	key: 'HeaderVisibilityState',
	default: true
})