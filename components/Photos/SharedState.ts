import {atom, selector, selectorFamily} from "recoil";
import {Media} from "../../domian";
import {mediasState} from '../../states/scan'
import {dataMapper, ItemTypeFromMediaType} from "./utils";
import {Column, Data, SectionType} from "../../types/interfaces";
import {DefaultCol} from "./Constants";


export const SectionByState = selector<SectionType>({
	key: 'SectionByState',
	get: ({get}) => {
		const col = get(ColumnState)
		switch (col) {
			case 2: {
				return SectionType.Day
			}
			default: {
				return SectionType.Month
			}
		}
	}
})

export const ColumnState = atom<Column>({
	key: 'ColumnState',
	default: DefaultCol
})

export const VerticalDataState = selector<Data[]>({
	key: 'VerticalDataState',
	get: ({get}) => {
		const medias = get(mediasState)
		const sectionType = get(SectionByState)
		return dataMapper(medias, sectionType)
	}
})

export const SelectedItemsState = atom({
	key: 'SelectedItemsState',
	default: {}
})

export const SelectModeState = selector({
	key:'SelectModeState',
	get:({get})=>{
		return Object.keys(get(SelectedItemsState)).length > 0
	},
	set:({reset})=>{
		reset(SelectedItemsState)	
	}
})

export const SelectCounterState = selector({
	key:'SelectCounterState',
	get:({get})=>{
		return Object.keys(get(SelectedItemsState)).length
	}
})

export const IsSelectedState = selectorFamily<boolean,string>({
	key: 'IsSelectedState',
	get: (id: string) => ({get}) => {
		return id in get(SelectedItemsState)
	},
	set: (id: string) => ({set, get}, newValue) => {
		if (newValue){
			if (!(id in get(SelectedItemsState))) {
				set(SelectedItemsState, ((prevValue) => {
					return { ...prevValue,[id]: id}
				}))
			}
		}else {
			if ((id in get(SelectedItemsState))) {
				set(SelectedItemsState, ((prevValue) => {
					// @ts-ignore
					const {[id]: _, ...rest} = prevValue
					return rest
				}))
			}
		}
	}
})

const HorizontalDataState = selector<Data[]>({
	key: 'HorizontalDataState',
	get: ({get}) => get(mediasState).map((media: Media) => {
		return {
			id: media.id,
			value: media,
			type: ItemTypeFromMediaType(media.mediaType)
		}
	})
})

interface HeaderActions {
	icon: string;
	color: string; 
	onPress: Function; 
	name: string;
}

interface HeaderOptions {
	showBack:boolean
	back:Function
	showLogo:boolean
	leftActions:HeaderActions[]
	rightActions:HeaderActions[]
	leftCounter:any
}

export const HeaderOptionsState = atom<HeaderOptions>({
	key:'HeaderState',
	default: {
		showBack:false,
		back:()=>{},
		showLogo:true,
		leftActions:[],
		rightActions:[],
		leftCounter:null
	}
}) 