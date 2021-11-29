import React, {ReactText, useEffect, useRef, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {useRecoilValue} from "recoil";
import {ColumnState, VerticalDataState} from "../SharedState";
import {DataProvider, RecyclerListView} from "recyclerlistview";
import ListItem from "./ListItems/ListItem";
import {Data} from "../../../types/interfaces";
import SelectedItems from "../Shared/SelectedItems";
import LayoutProvider from "./LayoutProvider";
import ItemAnimator from "./ItemAnimator";


const VerticalList: React.FC = () => {
	const data = useRecoilValue(VerticalDataState)
	const col = useRecoilValue(ColumnState)
	const [dataProvider, setDataProvider] = useState(new DataProvider(
			(r1, r2) => r1.id !== r2.id,
			index => data[index].id
		)
	)
	const recyclerRef = useRef<RecyclerListView<any, any>>()
	const layoutProvider = new LayoutProvider({dp: dataProvider, col})
	const animator = new ItemAnimator()
	// layoutProvider.shouldRefreshWithAnchoring = false;

	const rowRenderer = (type: ReactText, data: Data) => {
		return (<ListItem data={data} type={type}/>)
	}

	useEffect(() => {
		setDataProvider(dataProvider.cloneWithRows(data))
		// TODO fix scroll
	}, [data])


	return (
		dataProvider.getSize() > 0
			? <>
				<SelectedItems/>
				<RecyclerListView
					ref={recyclerRef}
					optimizeForInsertDeleteAnimations={true}
					scrollViewProps={
						{decelerationRate: 0.9}
					}
					style={styles.listContainer}
					layoutProvider={layoutProvider}
					dataProvider={dataProvider}
					itemAnimator={animator}
					rowRenderer={rowRenderer}/>
			</>
			: <View><Text>Loading</Text></View>
	)
}


const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
	},
});

export default VerticalList;


