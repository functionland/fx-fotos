import "react-native-get-random-values"
import * as React from "react"
import "react-native-get-random-values"
import { RouteProp } from "@react-navigation/native"
import { LongPressGestureHandler } from "react-native-gesture-handler"
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from "react-native"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import Animated, {
  runOnJS,
  withDelay,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
} from "react-native-reanimated"
import { withPause } from "react-native-redash"

import { AssetStory } from "../../types"

interface HighlightScreenProps {
  route: RouteProp<{ params: { highlights: AssetStory } }, "params">
}

const DELAY_DURATION = 5
const ANIMATION_DURATION = 1500
const OPACITY_FADE_DURATION = 111

interface timeBarProps {
  numberOfBars: number
  imageIdx: Animated.SharedValue<number>
  pauseAnimation: Animated.SharedValue<boolean>
  backgroundImageIdx: Animated.SharedValue<number>
  setTimeBarItems: React.Dispatch<React.SetStateAction<number[]>>
}

const TimeBar: React.FC<timeBarProps> = ({
  numberOfBars,
  imageIdx,
  pauseAnimation,
  backgroundImageIdx,
  setTimeBarItems,
}) => {
  const barWidth = useSharedValue(0)
  const BAR_WIDTH = (widthPercentageToDP(95) - 2 * numberOfBars) / numberOfBars

  const timeBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: barWidth.value,
    }
  })

  const updateImage = () => {
    if (imageIdx.value >= numberOfBars - 1) {
      return
    }

    imageIdx.value += 1
    setTimeBarItems((prev) => [...prev, imageIdx.value + 1])
  }

  const updateBackgroundImage = () => {
    if (backgroundImageIdx.value >= numberOfBars - 1) {
      return
    }

    backgroundImageIdx.value += 1
  }

  React.useLayoutEffect(() => {
    barWidth.value = withPause(
      withDelay(
        DELAY_DURATION,
        withTiming(
          BAR_WIDTH,
          {
            duration: ANIMATION_DURATION,
          },
          function (isFinished) {
            if (isFinished) {
              runOnJS(updateBackgroundImage)()
            }
          },
        ),
      ),
      pauseAnimation,
    )
  }, [])

  const _unused = useSharedValue(0)
  React.useLayoutEffect(() => {
    _unused.value = withPause(
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
  }, [])

  return <Animated.View style={[styles.timeBar, timeBarAnimatedStyle]} />
}

// TODO: Next & Previous Story by tapping left or right
export const HighlightScreen: React.FC<HighlightScreenProps> = ({ route }) => {
  const { data } = route.params.highlights

  const imageIdx = useSharedValue(0)
  const backgroundImageIdx = useSharedValue(0)
  const pauseAnimation = useSharedValue(false)
  const timeBarContainerOpacity = useSharedValue(1)

  const [timeBarItems, setTimeBarItems] = React.useState<number[]>([0])

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
        <View
          style={{
            position: "absolute",
            height: heightPercentageToDP(100),
            width: widthPercentageToDP(100),
          }}
        >
          <Image
            source={{ uri: data[backgroundImageIdx.value].uri }}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </View>
        <ImageBackground
          source={{ uri: data[imageIdx.value].uri }}
          style={{ height: "100%", width: "100%" }}
        >
          <Animated.View style={[styles.timeBarContainer, timeBarContainerAnimatedStyle]}>
            {timeBarItems.map((item) => {
              return (
                <TimeBar
                  key={item}
                  setTimeBarItems={setTimeBarItems}
                  backgroundImageIdx={backgroundImageIdx}
                  pauseAnimation={pauseAnimation}
                  numberOfBars={data.length}
                  imageIdx={imageIdx}
                />
              )
            })}
          </Animated.View>
          <Animated.View style={[styles.timeBarContainer, timeBarContainerAnimatedStyle]}>
            {data.map((item) => {
              return (
                <View
                  key={item.id}
                  style={[
                    styles.timeBar,
                    {
                      zIndex: 900,
                      backgroundColor: "rgba(0,0,0, 0.1)",
                      width: (widthPercentageToDP(95) - 2 * data.length) / data.length,
                    },
                  ]}
                />
              )
            })}
          </Animated.View>
          <TouchableOpacity style={styles.pressableContainerLeft} />
          <TouchableOpacity style={styles.pressableContainerRight} />
        </ImageBackground>
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
  pressibleContainers: {
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(30),
  },
  pressableContainerRight: {
    top: 0,
    bottom: 0,
    right: 0,
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(20),
    backgroundColor: "rgba(0,0,0, .2)",
  },
  pressableContainerLeft: {
    top: 0,
    bottom: 0,
    left: 0,
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(20),
    backgroundColor: "rgba(0,0,0, .2)",
  },
})
