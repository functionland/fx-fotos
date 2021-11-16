import React, {ReactText, useEffect, useState} from "react";
import {StatusBar, StyleSheet, Text, useWindowDimensions, View} from "react-native";
import {useRecoilValue} from "recoil";
import {ColumnState, VerticalDataState} from "../SharedState";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {
	FOOTER_HEIGHT,
	HeaderHeight,
	PhotoHeight,
	SectionHeaderBigHeight,
	SectionHeaderHeight,
	StoriesHeight
} from "../Constants";
import PhotoItem from "./ListItems/PhotoItem";
import {Media} from "../../../domian";
import VideoItem from "./ListItems/VideoItem";
import StoriesItem from "./ListItems/StoriesItem";
import SectionHeaderItem from "./ListItems/SectionHeader";
import {Data, ItemType, SectionHeader, story} from "../../../types/interfaces";


interface Props {

}

const VerticalList: React.FC<Props> = (props) => {
	const data = useRecoilValue(VerticalDataState)
	const col = useRecoilValue(ColumnState)
	const [dataProvider, setDataProvider] = useState(new DataProvider(
		(r1, r2) => r1.id !== r2.id)
	)
	const {height, width} = useWindowDimensions()
	const windowWidth = Math.round(width * 1000) / 1000 - 6;
	const layoutProvider = new LayoutProvider(
		(index) => dataProvider.getDataForIndex(index).type,
		(type, dim, index) => {
			const columnWidth = windowWidth / col
			switch (type) {
				case ItemType.Stories: {
					dim.width = windowWidth
					dim.height = StoriesHeight
					break;
				}
				case ItemType.Photo: {
					dim.width = columnWidth
					dim.height = PhotoHeight
					break;
				}
				case ItemType.Video: {
					dim.width = columnWidth
					dim.height = PhotoHeight
					break;
				}
				case ItemType.SectionHeader: {
					dim.width = windowWidth
					dim.height = SectionHeaderHeight
					break;
				}
				case ItemType.SectionHeaderBig: {
					dim.width = windowWidth
					dim.height = SectionHeaderBigHeight
					break;
				}
				default: {
					dim.width = windowWidth
					dim.height = 0
				}
			}
		},
	)
	const rowRenderer = (type: ReactText, data: Data, index: number, extendState?: Object) => {
		switch (type) {
			case ItemType.Photo: {
				return (<PhotoItem data={data.value as Media}/>)
			}
			case ItemType.Video: {
				return (<VideoItem data={data.value as Media}/>)
			}
			case ItemType.Stories: {
				return (<StoriesItem data={data.value as story[]}/>)
			}
			case ItemType.SectionHeader: {
				return (<SectionHeaderItem data={data.value as SectionHeader} big={false}/>)
			}
			case ItemType.SectionHeaderBig: {
				return (<SectionHeaderItem data={data.value as SectionHeader} big={true}/>)
			}
			default:
				throw Error("Type Not provided")
		}
	}

	useEffect(() => {
		setDataProvider(dataProvider.cloneWithRows(data))
	}, [data])
	return (
		data.length > 0
			? <RecyclerListView
				style={styles.listContainer}
				layoutProvider={layoutProvider}
				dataProvider={dataProvider}
				rowRenderer={rowRenderer}/>
			: <View><Text>Loading</Text></View>
	)
}


const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
	},
});

export default VerticalList;


