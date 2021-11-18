import React from "react";
import {FlatList, SafeAreaView, View} from "react-native";
import {story} from "../../../../types/interfaces";
import Highlights from "../../Shared/Highlights";
import {StoriesHeight} from "../../Constants";


interface Props {
	data:story[]
}

const StoriesItem: React.FC<Props> = (props) => {
	return(
		<SafeAreaView style={{position: 'relative', zIndex: 1, marginBottom:0}}>
			<FlatList
				data={props.data}
				horizontal={true}
				keyExtractor={(item: story, index: number) => 'StoryItem_' + index + '_' + item.text}
				getItemLayout={(data, index) => {
					return {
						length: 15 + StoriesHeight / 1.618,
						offset: index * (15 + StoriesHeight / 1.618),
						index: index
					}
				}}
				showsHorizontalScrollIndicator={false}
				renderItem={({item}) => (
					<View
						style={{
							width: 15 + StoriesHeight / 1.618,
							height: StoriesHeight ,
						}}>
						<Highlights
							story={item}
							duration={1500}
							height={StoriesHeight}
						/>
					</View>
				)}
			/>
		</SafeAreaView>
	)
}

export default StoriesItem;