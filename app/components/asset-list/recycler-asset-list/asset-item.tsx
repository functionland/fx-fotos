import React from "react";
import { StyleSheet, Image } from "react-native";
import { Asset } from "../../../types"

interface Props {
    asset: Asset
}

const AssetItem = (props: Props): JSX.Element => {
    const { asset } = props;
    return (
        <Image
            style={styles.image}
            source={{
                uri: asset.uri,
                priority: FastImage.priority.normal,
            }}
            resizeMode="contain"
        />
    )
}
const styles = StyleSheet.create({
    image: {
        backgroundColor: 'grey',
        flex: 1,
    },
})

export default AssetItem;