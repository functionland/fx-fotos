import React, { memo } from "react"
import { StyleSheet, View, Image, NativeSyntheticEvent, ImageErrorEventData } from "react-native"
import { useTheme } from "@rneui/themed"
import { Asset } from "../../../../types"
import { palette } from "../../../../theme/palette"
import { Checkbox } from "../../../checkbox/checkbox"

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { SharedElement } from "react-navigation-shared-element"

interface Props {
  asset: Asset
  selected: boolean
  selectionMode: boolean
  onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void
}
const AssetItem = (props: Props): JSX.Element => {
  const { asset, selected, selectionMode } = props
  const { theme } = useTheme()
  const scaleSharedValue = useSharedValue<number>(1)
  // const borderRadiusSharedValue = useSharedValue<number>(0)

  const imageContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(scaleSharedValue.value, {
            duration: 100,
          }),
        },
      ],
    }
  })

  React.useEffect(() => {
    if (selected) {
      scaleSharedValue.value = 0.8
    } else {
      scaleSharedValue.value = 1
    }
  }, [selected])
  return (
    <View style={[styles.container, {
      backgroundColor: theme.colors.grey5,
      borderColor: theme.colors.background
    }]}>
      <Animated.View style={[styles.imageContainer, imageContainerAnimatedStyle]}>
        <SharedElement style={styles.sharedElementContainer} id={asset.uri}>
          <Image
            style={styles.image}
            source={{
              uri: asset.uri,
            }}
            fadeDuration={100}
            resizeMode="cover"
            onError={props.onError}
          />
        </SharedElement>
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
    borderWidth: 2,
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  imageContainer: {
    flex: 1,
    overflow: "hidden",
    zIndex: 0,
  },
  sharedElementContainer: {
    flex: 1,
  },
})

const areEqual = (prev: Props, next: Props) => {
  return (
    prev?.asset?.id === next?.asset?.id &&
    prev?.selectionMode === next?.selectionMode &&
    prev?.selected === next?.selected
  )
}
export default memo(AssetItem, areEqual)
