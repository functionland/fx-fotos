import React from "react"
import { StyleSheet, View, LayoutChangeEvent } from "react-native"
import FastImage from "react-native-fast-image"

import { Asset } from "../../../../types"
import { palette } from "../../../../theme/palette"
import { Checkbox } from "../../../checkbox/checkbox"

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

interface Props {
  asset: Asset
  selected: boolean
  selectionMode: boolean
}

const AssetItem = (props: Props): JSX.Element => {
  const { asset, selected, selectionMode } = props

  const imageHeightRef = React.useRef(0)
  const imageSharedValue = useSharedValue<number>(0)
  const borderRadiusSharedValue = useSharedValue<number>(0)

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: imageSharedValue.value,
      width: imageSharedValue.value,
      borderRadius: borderRadiusSharedValue.value,
      resizeMode: "cover",
    }
  })

  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    imageSharedValue.value = height
    imageHeightRef.current = height
  }

  React.useEffect(() => {
    if (!selected) {
      imageSharedValue.value = withTiming(imageHeightRef.current, {
        duration: 500,
      })
      borderRadiusSharedValue.value = withTiming(0, {
        duration: 500,
      })
      return
    }

    imageSharedValue.value = withTiming((imageSharedValue.value * 60) / 100, { duration: 500 })
    borderRadiusSharedValue.value = withTiming(10, { duration: 500 })
  }, [selected])

  return (
    <View onLayout={onLayout} style={styles.container}>
      {selectionMode ? <Checkbox value={selected} style={styles.checkbox} /> : null}
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <FastImage
          style={styles.image}
          source={{
            uri: asset.uri,
            priority: FastImage.priority.normal,
          }}
          resizeMode="cover"
        />
      </Animated.View>
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
    alignItems: "center",
    borderColor: palette.white,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  imageContainer: {
    height: "100%",
    overflow: "hidden",
    width: "100%",
  },
})

export default AssetItem
