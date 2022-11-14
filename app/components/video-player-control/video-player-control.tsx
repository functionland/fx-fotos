import { Icon, Slider, Text } from '@rneui/themed'
import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import { secondToTimeString } from '../../utils/helper'
type Props = {
  containerStyle?: ViewStyle
  muted: boolean
  currentTime: number
  seekableDuration: number
  onVolumePresss?: () => void
  onValueChange?: (value: number) => void
}
// eslint-disable-next-line react/display-name
export const VideoPlayerControl = ({
  containerStyle,
  muted,
  currentTime = 0,
  seekableDuration = 100,
  onVolumePresss,
  onValueChange,
}: Props) => {
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={styles.timeText}>{secondToTimeString(currentTime)}</Text>
      <Slider
        style={styles.slider}
        thumbStyle={styles.thumbStyle}
        trackStyle={{ height: 2 }}
        minimumTrackTintColor="white"
        maximumTrackTintColor="gray"
        thumbTouchSize={{ height: 30, width: 30 }}
        minimumValue={0}
        maximumValue={seekableDuration}
        step={1}
        onValueChange={onValueChange}
        value={currentTime}
      />
      <Text style={styles.timeText}>
        {secondToTimeString(seekableDuration)}
      </Text>
      <Icon
        type="material-community"
        name={muted ? 'volume-off' : 'volume-high'}
        onPress={onVolumePresss}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  timeText: {
    fontSize: 12,
  },
  slider: {
    width: '60%',
    marginHorizontal: 10,
  },
  thumbStyle: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
  },
})
