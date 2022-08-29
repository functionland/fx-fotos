import * as React from "react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { Image, View, StyleSheet, TouchableOpacity, Dimensions, Platform } from "react-native"
import { FlatList, LongPressGestureHandler, PanGestureHandler } from "react-native-gesture-handler"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import Animated, {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  SharedValue,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { snapPoint, withPause } from "react-native-redash"
import FastImage from "react-native-fast-image"
import { useRecoilState } from "recoil"
import { Asset, AssetStory } from "../../types"
import { DataProvider, GridLayoutProvider, RecyclerListView } from "fula-recyclerlistview"
import { palette } from "../../theme"
import { selectedStoryState } from "../../store"

interface HighlightScreenProps {
  route: RouteProp<{ params: { highlights: AssetStory } }, "params">
}

const DELAY_DURATION = 0
const ANIMATION_DURATION = 1000
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
const { height: screenHeight, width: screenWidth } = Dimensions.get("window")
export const HighlightScreen: React.FC<HighlightScreenProps> = ({ route }) => {
  const navigation = useNavigation()
  const [selectedStory] = useRecoilState(selectedStoryState)
  const dataProvider = React.useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1?.id !== r2?.id)
    provider = provider.cloneWithRows(selectedStory?.data, 0)
    return provider
  }, [])

  const _layoutProvider = new GridLayoutProvider(
    1,
    () => "PHOTO",
    () => 1,
    () => screenWidth,
  )

  const _rowRenderer = (_: unknown, data: Asset, index) => {
    return (<LongPressGestureHandler
      minDurationMs={100}
      onActivated={() => (pauseAnimation.value = true)}
      onEnded={() => (pauseAnimation.value = false)}
    >
      {Platform.OS === "ios" ?
        <Image
          source={{ uri: data.uri }}
          resizeMode="contain"
          style={{ height: screenHeight, width: screenWidth }}
        />
        : <FastImage
          source={{ uri: data.uri, priority: "high" }}
          resizeMode="center"
          style={{ height: screenHeight, width: screenWidth }}
        />
      }
    </LongPressGestureHandler>)
  }

  const [imageIdx, setImageIdx] = React.useState(0)
  const pauseAnimation = useSharedValue(false)
  const timeBarContainerOpacity = useSharedValue(1)
  const highlightListRef = React.useRef<RecyclerListView<any, any>>(null)
  const [timeBarItems, setTimeBarItems] = React.useState<number[]>([0])

  const barWidth = useSharedValue(0)
  const BAR_WIDTH = (widthPercentageToDP(95) - 2 * selectedStory?.data?.length) / selectedStory?.data?.length

  const updateImage = () => {
    if (imageIdx >= selectedStory?.data?.length - 1) {
      return
    }

    setImageIdx((prev) => (prev += 1))
    setTimeBarItems((prev) => [...prev, imageIdx + 1])
  }

  React.useLayoutEffect(() => {
    const currentItem=dataProvider.getDataForIndex(imageIdx)
    highlightListRef.current.scrollToItem(currentItem, true)
  }, [imageIdx])

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

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const animatedOpacity = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(translateY.value, [0, screenHeight], [1, 0.5], Extrapolate.CLAMP)
    return {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
    }
  })

  const goBack = () => navigation.goBack()

  const onPanGesture = useAnimatedGestureHandler({
    onActive: ({ translationX, translationY }) => {
      isPanGestureActive.value = true
      translateX.value = translationX
      translateY.value = translationY
      if (!isPinchGestureActive.value) {
        animatedOpacity.value = interpolate(translationY, [0, 400], [1, 0.5], Extrapolate.CLAMP)
      }
    },
    onEnd: ({ velocityY }) => {
      if (isPinchGestureActive.value) {
        return
      }
      const shouldGoBack = snapPoint(translateY.value, velocityY, [0, 200])

      if (shouldGoBack) {
        runOnJS(goBack)()
      } else {
        translateX.value = withTiming(0, { duration: 100 })
        translateY.value = withTiming(0, { duration: 100 })
        animatedOpacity.value = interpolate(velocityY, [velocityY, 0], [1, 0.5], Extrapolate.CLAMP)
      }
      isPanGestureActive.value = false
    },
  })

  useAnimatedReaction(
    () => isPanGestureActive.value,
    (isGestureActive) => {
      if (isGestureActive) {
        pauseAnimation.value = true
        return
      }
      pauseAnimation.value = false
    },
    [isPanGestureActive.value],
  )

  return (
    <PanGestureHandler maxPointers={1} minPointers={1} onGestureEvent={onPanGesture}>
      <Animated.View style={animatedStyle}>
        <View>
          <View style={styles.rclWrapper}>
            <RecyclerListView
              isHorizontal={true}
              initialRenderIndex={0}
              ref={highlightListRef}
              style={{ flex: 1 }}
              layoutProvider={_layoutProvider}
              dataProvider={dataProvider}
              rowRenderer={_rowRenderer}
              renderAheadOffset={100}
              scrollViewProps={{
                scrollEnabled: false,
                pagingEnabled: true,
                showsHorizontalScrollIndicator: false,
                showsVerticalScrollIndicator: false,
              }}
            />
          </View>
          <Animated.View style={[styles.timeBarContainer, timeBarContainerAnimatedStyle]}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
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
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              data={selectedStory?.data}
              renderItem={() => {
                return (
                  <View
                    style={[
                      styles.timeBarPlaceholder,
                      {
                        width: (widthPercentageToDP(95) - 2 * selectedStory?.data?.length) / selectedStory?.data?.length,
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
              if (imageIdx >= selectedStory?.data?.length - 1) {
                return
              }
              setImageIdx((prev) => (prev += 1))
              setTimeBarItems((prev) => [...prev, imageIdx + 1])
            }}
            style={[styles.pressableContainer, { right: 0 }]}
          />
        </View>
      </Animated.View>
    </PanGestureHandler >
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
    backgroundColor: "rgba(255,255,255, 0.1)",
  },
  pressableContainer: {
    top: 0,
    bottom: 0,
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(20),
  },
  rclWrapper: {
    height: screenHeight,
    width: screenWidth,
    backgroundColor: palette.black,
  },
})
