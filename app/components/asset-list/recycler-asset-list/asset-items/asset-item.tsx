import React from "react"
import { StyleSheet, Image, View } from "react-native"
import FastImage from "react-native-fast-image"

import { Asset } from "../../../../types"
import { Checkbox } from "../../.."
import { palette } from "../../../../theme/palette"

interface Props {
  asset: Asset
  selected: boolean
  selectionMode: boolean
}

const AssetItem = (props: Props): JSX.Element => {
  const { asset, selected, selectionMode } = props
  return (
    <View style={styles.container}>
      {selectionMode ? <Checkbox value={selected} style={styles.checkbox} /> : null}
      <Image
        style={styles.image}
        source={{
          uri: asset.uri,
          priority: FastImage.priority.normal,
        }}
        resizeMode="cover"
        fadeDuration={100}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  checkbox: {
    left: 5,
    position: "absolute",
    top: 5,
    zIndex: 99,
  },
  container: {
    borderColor: palette.white,
    borderWidth: 1,
    flex: 1,
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
})

export default AssetItem
