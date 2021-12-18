import React, { memo } from "react";
import { TouchableHighlight, View, StyleSheet } from "react-native";
import { RecyclerAssetListSection, ViewType } from '../../../../types'
import StoryListItem from "./story-list-item"
import AssetItem from "./asset-item"
import HeaderItem from "./header-item"

interface Props {
	section: RecyclerAssetListSection
}
const getSectionByType = (section: RecyclerAssetListSection) => {
	switch (section.type) {
		case ViewType.STORY: {
			return (<StoryListItem stories={section.data} />)
		}
		case ViewType.ASSET: {
			return (<AssetItem asset={section.data} />)
		}
		case ViewType.MONTH: {
			return (<HeaderItem title={section.data} textStyle={styles.monthText} />)
		}
		case ViewType.DAY: {
			return (<HeaderItem title={section.data} textStyle={styles.dayText} />)
		}

		default:
			return null;
	}
}
const RecyclerSectionItem: React.FC<Props> = (props) => {
	const { section } = props;


	const backStyle = {
		flex: 1,
	}

	return (
		<TouchableHighlight
			style={styles.container}
			underlayColor='#dddddd'>
			<View style={backStyle}>
				{getSectionByType(section)}
			</View>
		</TouchableHighlight>
	);

}
const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	dayText: {
		fontSize: 14,
		fontWeight: "100",
		padding: 10,
		marginTop:10,
		color: "black",
	},
	monthText: {
		color: "black",
		fontSize: 28,
		fontWeight: "300",
		padding: 10,
		paddingTop:50,
	}
})

export default memo(RecyclerSectionItem, (prev, next) => prev?.section.id === next?.section.id);