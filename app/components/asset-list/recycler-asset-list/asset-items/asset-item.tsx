import React, { memo } from "react"
import { StyleSheet, View, LayoutChangeEvent, Image } from "react-native"
import FastImage from "react-native-fast-image"

import { Asset } from "../../../../types"
import { palette } from "../../../../theme/palette"
import { Checkbox } from "../../../checkbox/checkbox"

import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated"

interface Props {
  asset: Asset
  selected: boolean
  selectionMode: boolean
}
const AssetItem = (props: Props): JSX.Element => {
  const { asset, selected, selectionMode } = props

  const scaleSharedValue = useSharedValue<number>(1)
  // const borderRadiusSharedValue = useSharedValue<number>(0)

  const imageContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scaleSharedValue.value, {
            velocity: 1
          })
        }
      ],
      // TODO: chnage the image radius on animation
      // borderRadius: withTiming(borderRadiusSharedValue.value, { duration: 100 }),
    }
  })
  React.useEffect(() => {
    if (selected) {
      scaleSharedValue.value = 0.8
      // borderRadiusSharedValue.value = 10
    } else {
      scaleSharedValue.value = 1
      // borderRadiusSharedValue.value = 0
    }
  }, [selected])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageContainerAnimatedStyle]}>
        <Image
          style={styles.image}
          source={{
            uri: asset.uri,
          }}
          fadeDuration={100}
          resizeMode="cover"
        />
      </Animated.View>
      {selectionMode ? <Checkbox value={selected} style={styles.checkbox} /> : null}
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
    backgroundColor: palette.offWhite,
    borderColor: palette.white,
    borderWidth: 1,
    flex: 1
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  imageContainer: {
    flex: 1,
    overflow: "hidden",
    zIndex: 0
  }
})

const areEqual = (prev: Props, next: Props) => {
	return (prev?.asset?.id === next?.asset?.id
		&& prev?.selectionMode === next?.selectionMode
		&& prev?.selected === next?.selected)
}
export default memo(AssetItem, areEqual);