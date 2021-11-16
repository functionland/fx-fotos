import React, {ReactText} from "react";
import {StyleSheet, Text, Dimensions, View} from "react-native";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {PhotoHeight, SectionHeaderBigHeight, SectionHeaderHeight, StoriesHeight} from "../Constants";
import PhotoItem from "./ListItems/PhotoItem";
import {Media} from "../../../domian";
import VideoItem from "./ListItems/VideoItem";
import StoriesItem from "./ListItems/StoriesItem";
import SectionHeaderItem from "./ListItems/SectionHeader";
import {Column, Data, ItemType, SectionHeader, story} from "../../../types/interfaces";


interface Props {
	data: Data[],
	col: Column
}

class VerticalListClass extends React.Component<any, any> {
	private recyclerListViewRef: React.RefObject<unknown>;
	// private data: any;
	private layoutProvider: LayoutProvider;
	private static data: Data[];

	constructor(props: Props) {
		super(props);
		let col = props.col
		this.data = props.data
		let dataProvider = new DataProvider(
			(r1, r2) => r1 !== r2,
			index => this.data[index].id
		)
		const {height, width} = Dimensions.get("screen")
		const windowWidth = Math.round(width * 1000) / 1000 - 6;
		this.layoutProvider = new LayoutProvider(
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
		this.state = {
			dataProvider: dataProvider.cloneWithRows(this.data)
		}
		this.recyclerListViewRef = React.createRef();

	}

	static getDerivedStateFromProps(props: Props, state: any) {
		this.data=props.data
		return null;
	}


	rowRenderer = (type: ReactText, data: Data, index: number, extendState?: Object) => {
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

	render() {
		return (
			this.props.data.length > 0 
				? <RecyclerListView
					style={styles.listContainer}
					layoutProvider={this.layoutProvider}
					dataProvider={this.state.dataProvider}
					rowRenderer={this.rowRenderer}/>
				: <View><Text>Loading</Text></View>)
	}
}


const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
	},
});

export default VerticalListClass;


