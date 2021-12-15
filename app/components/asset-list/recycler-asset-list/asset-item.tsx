import React from "react";
import { StyleSheet, Image,View } from "react-native";
import FastImage from "react-native-fast-image";

import { Asset } from "../../../types"

interface Props {
    asset: Asset
}

const AssetItem = (props: Props): JSX.Element => {
    const { asset } = props;
    return (
        <View style={{flex:1,borderColor:'white',borderWidth:1}}>
        <Image
            style={styles.image}
            source={{
                uri: asset.uri,
                priority: FastImage.priority.normal,
            }}
            resizeMode="cover"
            fadeDuration={0}
        />
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
    image: {
        flex:1,
        height: undefined,
        width: undefined
    },
})

export default AssetItem;