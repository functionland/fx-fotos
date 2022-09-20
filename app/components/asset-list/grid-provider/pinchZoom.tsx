import React from 'react'
import { StyleSheet } from 'react-native'
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import Reanimated, {
  useAnimatedGestureHandler,
  withTiming,
} from 'react-native-reanimated'
import { useScale, useColumnsNumber, usePinching } from './gridContext'
import { MIN_COLUMNS, MAX_COLUMNS } from './gridLayoutManager'

interface Props {}

const PinchZoom: React.FC<Props> = props => {
  const scale = useScale()
  const pinching = usePinching()
  const [numColumns] = useColumnsNumber()

  const _onPinchGestureEvent = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    {}
  >(
    {
      onStart: () => {
        pinching.value = false
      },
      onActive: event => {
        const result = numColumns.value + 1 - event.scale // linear scale, not geometric, we revert to 0 as the origin
        scale.value = Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, result))
        pinching.value = true
      },
      onEnd: event => {
        let result = numColumns.value + 1 - event.scale // linear scale, not geometric, we revert to 0 as the origin
        if (event.scale > 1) result -= 0.3
        else result += 0.3
        result = Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, result))
        scale.value = withTiming(
          Math.round(result),
          {
            duration: 250,
          },
          () => {
            numColumns.value = scale.value
            pinching.value = false
          },
        )
      },
      onFail: () => {
        scale.value = withTiming(
          Math.round(scale.value),
          {
            duration: 250,
          },
          () => {
            numColumns.value = scale.value
            pinching.value = false
          },
        )
      },
      onCancel: () => {
        scale.value = withTiming(
          Math.round(scale.value),
          {
            duration: 250,
          },
          () => {
            numColumns.value = scale.value
            pinching.value = false
          },
        )
      },
    },
    [],
  )

  return (
    <PinchGestureHandler onGestureEvent={_onPinchGestureEvent}>
      <Reanimated.View style={styles.container}>
        {props.children}
      </Reanimated.View>
    </PinchGestureHandler>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
export default PinchZoom
