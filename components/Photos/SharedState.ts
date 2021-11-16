import {atom, selector} from "recoil";
import {Media} from "../../domian";
import {mediasState} from '../../states/scan'
import {dataMapper, ItemTypeFromMediaType} from "./utils";
import {Column, Data, SectionType} from "../../types/interfaces";



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
	default: 2
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
	key:'SelectedItemsState',
	default: {}
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