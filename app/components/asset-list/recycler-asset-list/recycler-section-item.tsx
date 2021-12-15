import React, { memo, ReactText, useEffect, useState } from "react";
import { TouchableHighlight, View, StyleSheet } from "react-native";
import { RecyclerAssetListSection, ViewType } from '../../../types'
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
			return (<HeaderItem title={"Month"} textStyle={styles.monthText} />)
		}
		case ViewType.DAY: {
			return (<HeaderItem title={"day"} />)
		}

		default:
			return null;
	}
}
const RecyclerSectionItem: React.FC<Props> = (props) => {
	const { section } = props;


	const backStyle = {
		flex: 1,
		//margin: selected ? 8 : 0
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
	monthText: {
		fontSize: 24
	}
})

//export default RecyclerSectionItem;
export default memo(RecyclerSectionItem,(prev,next)=>prev?.section.id===next?.section.id);