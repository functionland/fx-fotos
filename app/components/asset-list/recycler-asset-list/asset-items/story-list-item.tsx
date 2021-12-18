import React from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { AssetStory } from "../../../types"

interface Props {
    stories: AssetStory[]
}

const StoryListItem = (props: Props): JSX.Element => {
    const { stories } = props;
    return (
        <View style={styles.container}>
            <FlatList
                data={stories}
                horizontal={true}
                keyExtractor={(item, index) => 'StoryItem_' + index}
                // getItemLayout={(data, index) => {
                //     return {
                //         length: 15 + StoriesHeight / 1.618,
                //         offset: index * (15 + StoriesHeight / 1.618),
                //         index: index
                //     }
                // }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View
                        key={index}
                        style={styles.itemCntainer}>
                        <Text>{item.title}</Text>
                    </View>
                )}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    itemCntainer: {
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        width: 150
    }
})

export default StoryListItem;