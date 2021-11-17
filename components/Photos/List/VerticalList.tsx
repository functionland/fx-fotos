import React, {ReactText, useEffect, useState} from "react";
import {StatusBar, StyleSheet, Text, useWindowDimensions, View} from "react-native";
import {useRecoilState, useRecoilValue} from "recoil";
import {ColumnState, SelectedItemsState, VerticalDataState} from "../SharedState";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {
	FOOTER_HEIGHT,
	HeaderHeight,
	PhotoHeight,
	SectionHeaderBigHeight,
	SectionHeaderHeight,
	StoriesHeight
} from "../Constants";
import ListItem from "./ListItems/ListItem";
import {Data, ItemType} from "../../../types/interfaces";
import SelectedItems from "../Shared/SelectedItems";


interface Props {

}

interface ExtendedState extends Object {
	selected: {}
}

const VerticalList: React.FC<Props> = (props) => {
	const data = useRecoilValue(VerticalDataState)
	const col = useRecoilValue(ColumnState)
	const [dataProvider, setDataProvider] = useState(new DataProvider(
		(r1, r2) => r1.id !== r2.id)
	)
	const {width} = useWindowDimensions()
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
					dim.height = columnWidth * 1.3
					break;
				}
				case ItemType.Video: {
					dim.width = columnWidth
					dim.height = columnWidth * 1.3
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

	const rowRenderer = (type: ReactText, data: Data, index: number) => {
		return (<ListItem data={data} type={type}/>)
	}


	useEffect(() => {
		setDataProvider(dataProvider.cloneWithRows(data))
	}, [data])
	return (
		data.length > 0
			? <>
				<SelectedItems/>
				<RecyclerListView
					// extendedState={extendedState}
					style={styles.listContainer}
					layoutProvider={layoutProvider}
					dataProvider={dataProvider}
					scrollViewProps={{
						removeClippedSubviews: true,
						decelerationRate: 0.9
					}}
					// renderAheadOffset={10}
					rowRenderer={rowRenderer}/></>
			: <View><Text>Loading</Text></View>
	)
}


const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
	},
});

export default VerticalList;


