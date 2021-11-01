import {atom} from 'recoil'
import {album} from '../types/interfaces';



export const imagePositionState = atom<{ x: number; y: number }>({
	key: 'imagePositionState',
	default: {x: 0, y: 0},
});

export const identityState = atom<any>({
	key: 'identityState',
	default: null,
});

export const contactsState = atom<Array<{ id: string }>>({
	key: 'contactsState',
	default: [],
});

export const albumsState = atom<Array<album>>({
	key: 'albumsState',
	default: [],
});



import {mediasState} from './scan'
export {mediasState}