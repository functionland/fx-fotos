import { Icon, Slider, Text } from '@rneui/themed'
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
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
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.timeText}>{secondToTimeString(currentTime)}</Text>
      <Slider
        style={{ width: '60%', marginHorizontal: 10 }}
        thumbStyle={{ backgroundColor: 'white', width: 12, height: 12 }}
        trackStyle={{ backgroundColor: 'white', height: 2 }}
        thumbTouchSize={{ height: 20, width: 20 }}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  timeText: {
    color: 'back',
    fontSize: 12,
  },
})
