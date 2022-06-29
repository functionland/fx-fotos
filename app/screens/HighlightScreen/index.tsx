import * as React from "react"
import shortid from "shortid"
import { RouteProp } from "@react-navigation/native"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { FlatList, LongPressGestureHandler } from "react-native-gesture-handler"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import Animated, {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  SharedValue,
} from "react-native-reanimated"
import { withPause } from "react-native-redash"
import FastImage from "react-native-fast-image"

import { AssetStory } from "../../types"

interface HighlightScreenProps {
  route: RouteProp<{ params: { highlights: AssetStory } }, "params">
}

const DELAY_DURATION = 5
const ANIMATION_DURATION = 1500
const OPACITY_FADE_DURATION = 111

interface timeBarProps {
  width: number
  pause: SharedValue<boolean>
}

const TimeBar: React.FC<timeBarProps> = ({ width, pause }) => {
  const barWidth = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: barWidth.value,
    }
  })

  React.useLayoutEffect(() => {
    barWidth.value = withPause(
      withTiming(width, {
        duration: ANIMATION_DURATION - DELAY_DURATION,
      }),
      pause,
    )
  }, [])

  return <Animated.View style={[styles.timeBar, animatedStyle]} />
}

export const HighlightScreen: React.FC<HighlightScreenProps> = ({ route }) => {
  const { data } = route.params.highlights

  const [imageIdx, setImageIdx] = React.useState(0)
  const pauseAnimation = useSharedValue(false)
  const timeBarContainerOpacity = useSharedValue(1)
  const highlightListRef = React.useRef<FlatList>(null)
  const [timeBarItems, setTimeBarItems] = React.useState<number[]>([0])

  const barWidth = useSharedValue(0)
  const BAR_WIDTH = (widthPercentageToDP(95) - 2 * data.length) / data.length

  const updateImage = () => {
    if (imageIdx >= data.length - 1) {
      return
    }

    setImageIdx((prev) => (prev += 1))
    setTimeBarItems((prev) => [...prev, imageIdx + 1])
  }

  React.useLayoutEffect(() => {
    barWidth.value = withPause(
      withTiming(
        BAR_WIDTH,
        {
          duration: ANIMATION_DURATION - DELAY_DURATION,
        },
        function (isFinished) {
          if (isFinished) {
            runOnJS(updateImage)()
          }
        },
      ),
      pauseAnimation,
    )
  }, [imageIdx])

  React.useEffect(() => {
    highlightListRef.current.scrollToIndex({ animated: true, index: imageIdx })
  }, [imageIdx])

  const timeBarContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: timeBarContainerOpacity.value,
    }
  })

  useAnimatedReaction(
    () => pauseAnimation.value,
    (paused, _) => {
      timeBarContainerOpacity.value = withTiming(paused ? 0 : 1, {
        duration: OPACITY_FADE_DURATION,
      })
    },
    [pauseAnimation],
  )

  return (
    <LongPressGestureHandler
      minDurationMs={100}
      onActivated={() => (pauseAnimation.value = true)}
      onEnded={() => (pauseAnimation.value = false)}
    >
      <View style={{ backgroundColor: "#000" }}>
        <FlatList
          ref={highlightListRef}
          scrollEnabled={false}
          horizontal={true}
          data={data}
          keyExtractor={() => shortid.generate()}
          renderItem={({ item }) => {
            return (
              <FastImage
                resizeMode={FastImage.resizeMode.cover}
                source={{ uri: item.uri, priority: FastImage.priority.high }}
                style={{ height: heightPercentageToDP(100), width: widthPercentageToDP(100) }}
              />
            )
          }}
          getItemLayout={(data, index) => ({
            length: data.length * widthPercentageToDP(100),
            offset: widthPercentageToDP(100) * index,
            index,
          })}
        />
        <Animated.View style={[styles.timeBarContainer, timeBarContainerAnimatedStyle]}>
          <FlatList
            horizontal
            keyExtractor={(item) => item.toString()}
            data={timeBarItems}
            renderItem={() => {
              return <TimeBar width={BAR_WIDTH} pause={pauseAnimation} />
            }}
          />
        </Animated.View>
        <Animated.View style={[styles.timeBarContainer, timeBarContainerAnimatedStyle]}>
          <FlatList
            horizontal
            keyExtractor={(item) => item.id}
            data={data}
            renderItem={() => {
              return (
                <View
                  style={[
                    styles.timeBarPlaceholder,
                    {
                      width: (widthPercentageToDP(95) - 2 * data.length) / data.length,
                    },
                  ]}
                />
              )
            }}
          />
        </Animated.View>
        <TouchableOpacity
          onPress={() => {
            if (imageIdx <= 0) {
              return
            }
            setImageIdx((prev) => (prev -= 1))
            setTimeBarItems((prev) => prev.slice(0, -1))
            barWidth.value = BAR_WIDTH
          }}
          style={[styles.pressableContainer, { left: 0 }]}
        />
        <TouchableOpacity
          onPress={() => {
            if (imageIdx >= data.length - 1) {
              return
            }
            setImageIdx((prev) => (prev += 1))
            setTimeBarItems((prev) => [...prev, imageIdx + 1])
          }}
          style={[styles.pressableContainer, { right: 0 }]}
        />
      </View>
    </LongPressGestureHandler>
  )
}

const styles = StyleSheet.create({
  timeBarContainer: {
    width: "95%",
    flexDirection: "row",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    marginLeft: widthPercentageToDP(2.5),
    marginRight: "auto",
    position: "absolute",
  },
  timeBar: {
    height: 4,
    marginTop: 40,
    zIndex: 99999999,
    borderRadius: 100,
    backgroundColor: "grey",
    marginLeft: 2,
  },
  timeBarPlaceholder: {
    height: 4,
    marginTop: 40,
    borderRadius: 100,
    marginLeft: 2,
    zIndex: 900,
    backgroundColor: "rgba(0,0,0, 0.1)",
  },
  pressableContainer: {
    top: 0,
    bottom: 0,
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(20),
  },
})
