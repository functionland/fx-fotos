import { GridLayoutProvider } from 'recyclerlistview';
import {ItemType} from "../../../types/interfaces";
import {HeaderHeight, SectionHeaderBigHeight, SectionHeaderHeight, StoriesHeight} from "../Constants";
import {DataProvider} from "recyclerlistview";
const MAX_SPAN = 12;
export default class LayoutProvider extends GridLayoutProvider {
	constructor(props:{dp:DataProvider,col:number}) {
		super(MAX_SPAN,
			(index: number) => {
				return props.dp.getDataForIndex(index).type;
			},
			(index: number) => {
				let type = props.dp.getDataForIndex(index).type;
				let col = props.col
				switch (type) {
					case ItemType.Header: {
						return MAX_SPAN
					}
					case ItemType.Stories: {
						return MAX_SPAN
					}
					case ItemType.Photo: {
						return Math.round(MAX_SPAN/col)
					}
					case ItemType.Video: {
						return Math.round(MAX_SPAN/col)
					}
					case ItemType.SectionHeader: {
						return MAX_SPAN
					}
					case ItemType.SectionHeaderBig: {
						return MAX_SPAN
					}
					case ItemType.SectionHeaderMedium: {
						return MAX_SPAN
					}
					default: {
						return 0
					}
				}
			},
			(index:number) => {
				let type = props.dp.getDataForIndex(index).type;
				switch (type) {
					case ItemType.Header: {
						return HeaderHeight
					}
					case ItemType.Stories: {
						return StoriesHeight
					}
					case ItemType.Photo: {
						return 200
					}
					case ItemType.Video: {
						return 200
					}
					case ItemType.SectionHeader: {
						return SectionHeaderHeight
					}
					case ItemType.SectionHeaderBig: {
						return SectionHeaderBigHeight
					}
					case ItemType.SectionHeaderMedium: {
						return SectionHeaderBigHeight
					}
					default: {
						return 0
					}
				}
			},

		);
	}
}