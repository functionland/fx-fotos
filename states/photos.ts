import {atom, selector} from "recoil";
import {headerIndex, layout, sortCondition, story} from "../types/interfaces";

export const storyState = atom<story | undefined>({
	key: 'storyState',
	default: undefined,
});

export const numColumnsState = atom<2 | 3 | 4>({
	key: 'numColumnsState',
	default: 2,
});

export const sortConditionState = selector<sortCondition>({
	key: 'sortConditionState',
	
	get: ({get}) => {
		return get(numColumnsState)===4?'month':'day'
	}
})

export const storiesState = atom<story[]>({
	key: 'storiesState',
	default: [],
});

export const headerIndexesState = atom<headerIndex[]>({
	key: 'headerIndexesState',
	default: [],
})

export const layoutState = atom<layout[]>({
	key: 'layoutState',
	default: [],
})

export const lastTimestampState = atom<number>({
	key: 'lastTimestampState',
	default: 0
})



