import React, { useRef } from "react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { Image, View, StyleSheet, TouchableOpacity, Dimensions, Platform } from "react-native"
import { LongPressGestureHandler, NativeViewGestureHandler, PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler"
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import Animated, {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { snapPoint } from "react-native-redash"
import FastImage from "react-native-fast-image"
import { useRecoilState } from "recoil"
import { Asset, AssetStory } from "../../types"
import { DataProvider, LayoutProvider, RecyclerListView } from "fula-recyclerlistview"
import { selectedStoryState } from "../../store"
import { Screen, TimerProgress, TimerProgressHandler } from "../../components"
import { Text } from "@rneui/themed"


interface HighlightScreenProps {
  route: RouteProp<{ params: { highlights: AssetStory } }, "params">
}

const OPACITY_FADE_DURATION = 111

const { height: screenHeight, width: screenWidth } = Dimensions.get("window")
export const HighlightScreen: React.FC<HighlightScreenProps> = ({ route }) => {
  const navigation = useNavigation()
  const gestureHanlderRef = useRef<NativeViewGestureHandler>()
  const panGestureRef = useRef<PanGestureHandler>()
  const timerRef = useRef(null)
  const [selectedStory] = useRecoilState(selectedStoryState)
  const [imageIdx, setImageIdx] = React.useState(0)
  const pauseTimeProgress = useSharedValue(false)
  const timeBarContainerOpacity = useSharedValue(1)
  const highlightListRef = React.useRef<RecyclerListView<any, any>>(null)
  const timerProgressRef = useRef<TimerProgressHandler>()
  const longPressRef = useRef<LongPressGestureHandler>()


  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const animatedOpacity = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)
  const goBack = () => navigation.goBack()

  const dataProvider = React.useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1?.id !== r2?.id)
    provider = provider.cloneWithRows(selectedStory?.data, 0)
    return provider
  }, [])

  const _layoutProvider = new LayoutProvider(() => "Asset", (_, dim) => {
    dim.height = screenHeight
    dim.width = screenWidth
  })

  const _rowRenderer = React.useCallback((_: unknown, data: Asset, index) => {
    return (
      Platform.OS === "ios" ?
        <Image
          source={{ uri: data.uri }}
          resizeMode="contain"
          style={{ height: screenHeight, width: screenWidth }}
        />
        : <FastImage
          source={{ uri: data.uri, priority: "high" }}
          resizeMode="contain"
          style={{ height: screenHeight, width: screenWidth }}
        />
    )
  }, [])

  const updateImage = () => {
    if (imageIdx >= selectedStory?.data?.length - 1) {
      return
    }
    setImageIdx((prev) => (prev += 1))
  }
  const nextImage = (value: number) => {
    if (timerRef.current)
      clearTimeout(timerRef.current)
    setImageIdx((prev) => {
      if (prev + value >= 0 && (prev + value) < selectedStory?.data?.length)
        prev += value
      return prev
    })
    timerRef.current = setTimeout(() => {
      timerRef.current = null
    }, 500)
    timerProgressRef?.current?.start()
  }

  React.useEffect(() => {
    setTimeout(() => {
      highlightListRef.current?.scrollToIndex(imageIdx, true)
      if (!timerRef.current)
        timerProgressRef?.current?.start()
    }, 0);
  }, [imageIdx])

  const timeBarContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: timeBarContainerOpacity.value,
    }
  }, [])

  useAnimatedReaction(
    () => pauseTimeProgress.value,
    (paused, _) => {
      timeBarContainerOpacity.value = withTiming(paused ? 0 : 1, {
        duration: OPACITY_FADE_DURATION,
      })
    },
    [pauseTimeProgress],
  )

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(translateY.value, [0, screenHeight], [1, 0.5], Extrapolate.CLAMP)
    return {
      flex: 1,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
    }
  }, [])


  const onPanGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive({ translationX, translationY }) {
      isPanGestureActive.value = true
      translateX.value = translationX
      translateY.value = translationY
      if (!isPinchGestureActive.value) {
        animatedOpacity.value = interpolate(translationY, [0, 400], [1, 0.5], Extrapolate.CLAMP)
      }
      pauseTimeProgress.value = true
    },
    onEnd({ velocityY }) {
      pauseTimeProgress.value = false
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
    }
  })

  useAnimatedReaction(
    () => isPanGestureActive.value,
    (isGestureActive) => {
      if (isGestureActive) {
        pauseTimeProgress.value = true
        return
      }
      pauseTimeProgress.value = false
    }, [])

  return (
    <Screen scrollEventThrottle={16} automaticallyAdjustContentInsets style={styles.screen}>
      <NativeViewGestureHandler ref={gestureHanlderRef}>
        <Animated.View style={[containerAnimatedStyle]}>
          <PanGestureHandler ref={panGestureRef} waitFor={[longPressRef]} maxPointers={1}
            minPointers={1} onGestureEvent={onPanGesture}
          >
            <Animated.View style={{ flex: 1 }}>
              <Animated.View style={[styles.timeBarContainer, timeBarContainerAnimatedStyle]}>
                <View>
                  <Text>{imageIdx + 1}/{selectedStory?.data?.length}</Text>
                </View>
                <TimerProgress ref={timerProgressRef} onLayout={() => {
                  timerProgressRef?.current?.start()
                }} onTimerEnd={updateImage} pause={pauseTimeProgress} />
              </Animated.View>
              <LongPressGestureHandler
                ref={longPressRef}
                onHandlerStateChange={({ nativeEvent }) => {
                  if (nativeEvent.state === State.ACTIVE) {
                    pauseTimeProgress.value = true
                  } else {
                    pauseTimeProgress.value = false
                  }
                }}
                minDurationMs={150}>
                <RecyclerListView
                  style={{ flex: 1 }}
                  isHorizontal={true}
                  initialRenderIndex={0}
                  ref={highlightListRef}
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
              </LongPressGestureHandler>
              <TouchableOpacity
                onPress={() => nextImage(-1)}
                style={[styles.pressableContainer, { left: 0 }]}
              />
              <TouchableOpacity
                onPress={() => nextImage(1)}
                style={[styles.pressableContainer, { right: 0 }]}
              />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View >
      </NativeViewGestureHandler>
    </Screen>
  )
}

const styles = StyleSheet.create({
  timeBarContainer: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  timeBarPlaceholder: {
    height: 4,
    marginTop: 40,
    borderRadius: 100,
    marginLeft: 2,
    zIndex: 9,
    backgroundColor: "blue"// "rgba(255,255,255, 0.1)",
  },
  pressableContainer: {
    top: 0,
    bottom: 0,
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(20),
  }
})