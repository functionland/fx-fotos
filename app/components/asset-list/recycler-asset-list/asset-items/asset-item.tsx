import React from "react";
import { StyleSheet, Image, View } from "react-native";
import FastImage from "react-native-fast-image";

import { Asset } from "../../../../types"
import { Checkbox } from "../../.."

interface Props {
    asset: Asset,
    selected: boolean;
    selectionMode: boolean;
}

const AssetItem = (props: Props): JSX.Element => {
    const { asset, selected, selectionMode } = props;
    return (
        <View style={styles.container}>
            <Image
                style={styles.image}
                source={{
                    uri: asset.uri,
                    priority: FastImage.priority.normal,
                }}
                resizeMode="cover"
                fadeDuration={100}
            />
            {selectionMode ? <Checkbox value={selected} style={{ position: "absolute", top: 5, left: 5, zIndex: 999 }} /> : null}
            {/* <FastImage
				style={styles.image}
				source={{
                    uri: asset.uri,
					priority: FastImage.priority.high,
                    cache:FastImage.cacheControl.immutable
				}}
				resizeMode={FastImage.resizeMode.cover}
			/> */}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        borderColor: 'white',
        borderWidth: 1,
        flex: 1
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined,
        zIndex: 0
    },
})

export default AssetItem;