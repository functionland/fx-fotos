import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedReaction,
  withSpring
} from "react-native-reanimated"
export const useFloatHederAnimation = (maxHeight: number) => {
  const scrollY = useSharedValue(0)
  const diffY = useSharedValue(0)
  useAnimatedReaction(
    () => {
      return scrollY.value
    },
    (result, previous) => {
      if (result !== previous) {
        const diff = (previous || 0) - result
        diffY.value = interpolate(
          diffY.value + diff,
          [-maxHeight * 2, 0],
          [-maxHeight * 2, 0],
          Animated.Extrapolate.CLAMP,
        )
      }
    },
    [scrollY],
  )
  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
            translateY: diffY.value
        },
      ],
    }
  })
  return [scrollY, styles]
}
