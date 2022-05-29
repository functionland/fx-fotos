import React, { memo } from "react"
import { StyleSheet, View, Image, NativeSyntheticEvent, ImageErrorEventData } from "react-native"
import { Icon, Text, useTheme } from "@rneui/themed"

import { Asset } from "../../../../types"
import { Checkbox } from "../../../checkbox/checkbox"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { SharedElement } from "react-navigation-shared-element"
import { convertDurationToTime } from "../../../../utils/helper"

interface Props {
  asset: Asset
  selected: boolean
  selectionMode: boolean,
  isSynced: boolean,
  isDeleted: boolean,
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
        {props?.isDeleted && props?.isSynced ? <Icon type="material-community" name="alpha-f-box-outline" size={50} color="gray" /> : <SharedElement style={styles.sharedElementContainer} id={asset.uri}>
          <Image
            style={styles.image}
            source={{
              uri: asset?.uri,
            }}
            fadeDuration={100}
            resizeMode="cover"
            onError={props.onError}
          />
        </SharedElement>}
      </Animated.View>
      {asset?.mediaType === "video" &&
        <View style={styles.videoIconContainer}>
          <Text style={styles.videoDurationText}>{convertDurationToTime(asset?.duration)}</Text>
          <Icon name="play-circle" type="material-community" size={20} color="gray" />
        </View>}
      {asset?.isSynced &&
        <View style={styles.syncIconContainer}>
          <Icon name="cloud-check" type="material-community" size={15} color="gray" />
        </View>}
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
    justifyContent:"center"
  },
  sharedElementContainer: {
    flex: 1,
    justifyContent: "center"
  },
  videoIconContainer: {
    right: 10,
    position: "absolute",
    bottom: 10,
    zIndex: 99,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    opacity: .8
  },
  videoDurationText: {
    color: "gray",
    fontSize: 10,
    padding: 1
  },
  syncIconContainer: {
    right: 10,
    position: "absolute",
    top: 10,
    zIndex: 99,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 1,
    opacity: .7
  },
})

const areEqual = (prev: Props, next: Props) => {
  return (
    prev?.asset?.id === next?.asset?.id &&
    prev?.selectionMode === next?.selectionMode &&
    prev?.selected === next?.selected &&
    prev?.isSynced === next?.isSynced &&
    prev?.isDeleted === next?.isDeleted
  )
}
export default memo(AssetItem, areEqual)
