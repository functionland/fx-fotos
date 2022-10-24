import React, { useEffect, useRef } from 'react'
import { RouteProp, useNavigation } from '@react-navigation/native'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native'
import { LongPressGestureHandler, State } from 'react-native-gesture-handler'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated'
import FastImage from 'react-native-fast-image'
import { useRecoilState } from 'recoil'
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from 'fula-recyclerlistview'
import { Asset, AssetStory } from '../../types'
import { TimerProgress, TimerProgressHandler } from '../../components'
import { Text } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'

interface HighlightScreenProps {
  route: RouteProp<
    {
      params: {
        highlights: AssetStory
      }
    },
    'params'
  >
  title: string
  animationValue?: Animated.SharedValue<number>
  active: boolean
  paused: boolean
  assets: Asset[]
  onNextStory?: (direction: 'next' | 'previous') => void
}

const OPACITY_FADE_DURATION = 111

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')
export const Highlights: React.FC<HighlightScreenProps> = ({
  route,
  title,
  animationValue,
  active = true,
  assets = [],
  paused = false,
  onNextStory,
}) => {
  const timerRef = useRef(null)
  const [imageIdx, setImageIdx] = React.useState(0)
  const pauseTimeProgress = useSharedValue(false)
  const timeBarContainerOpacity = useSharedValue(1)
  const highlightListRef = React.useRef<RecyclerListView<any, any>>(null)
  const timerProgressRef = useRef<TimerProgressHandler>()
  const longPressRef = useRef<LongPressGestureHandler>()

  const selectedStoryData = assets.slice(0, 40)
  const dataProvider = React.useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1?.id !== r2?.id)
    provider = provider.cloneWithRows(selectedStoryData, 0)
    return provider
  }, [])

  const _layoutProvider = new LayoutProvider(
    () => 'Asset',
    (_, dim) => {
      dim.height = screenHeight
      dim.width = screenWidth
    },
  )

  const _rowRenderer = React.useCallback(
    (_: unknown, data: Asset, index) =>
      Platform.OS === 'ios' ? (
        <Image
          source={{ uri: data.uri }}
          resizeMode="contain"
          style={[{ height: screenHeight, width: screenWidth }, styles.image]}
        />
      ) : (
        <FastImage
          source={{
            uri: data.uri,
            priority: 'high',
          }}
          resizeMode="contain"
          style={[{ height: screenHeight, width: screenWidth }, styles.image]}
        />
      ),
    [],
  )

  const updateImage = () => {
    nextImage(1)
  }
  const nextImage = (value: number) => {
    setImageIdx(prev => {
      let next = prev
      if (prev + value >= 0 && prev + value < selectedStoryData?.length)
        next += value

      if (next == prev) {
        value > 0 ? onNextStory?.('next') : onNextStory?.('previous')
      }

      return next
    })
  }
  useEffect(() => {
    const timerProgressRef_current = timerProgressRef?.current
    return () => {
      timerProgressRef_current?.stop()
    }
  }, [])
  React.useEffect(() => {
    clearTimeout(timerRef.current)
    setTimeout(() => {
      highlightListRef.current?.scrollToIndex(imageIdx, true)
    }, 0)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      timerProgressRef?.current?.start(imageIdx)
    }, 100)
  }, [imageIdx])

  const timeBarContainerAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: timeBarContainerOpacity.value,
    }),
    [],
  )

  useAnimatedReaction(
    () => pauseTimeProgress.value,
    (paused, _) => {
      timeBarContainerOpacity.value = withTiming(paused ? 0 : 1, {
        duration: OPACITY_FADE_DURATION,
      })
    },
    [pauseTimeProgress],
  )
  useEffect(() => {
    pauseTimeProgress.value = paused
  }, [paused, pauseTimeProgress])
  return (
    <Animated.View style={[{ flex: 1, backgroundColor: 'black' }]}>
      <Animated.View
        style={[
          styles.timeBarContainer,
          paused ? {} : timeBarContainerAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(33,33,33,0.3)',
            'rgba(33,33,33,0.2)',
            'rgba(33,33,33,0)',
          ]}
          style={styles.gradientContainer}
        >
          <TimerProgress
            ref={timerProgressRef}
            onLayout={() => {
              timerProgressRef?.current?.start()
            }}
            onTimerEnd={updateImage}
            pause={pauseTimeProgress}
            barCount={dataProvider.getSize()}
          />
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
      </Animated.View>
      {active && (
        <LongPressGestureHandler
          ref={longPressRef}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              pauseTimeProgress.value = true
            } else {
              pauseTimeProgress.value = false
            }
          }}
          minDurationMs={150}
        >
          <RecyclerListView
            style={{ flex: 1 }}
            isHorizontal
            initialRenderIndex={imageIdx}
            ref={highlightListRef}
            layoutProvider={_layoutProvider}
            dataProvider={dataProvider}
            rowRenderer={_rowRenderer}
            renderAheadOffset={100}
            scrollViewProps={{
              scrollEnabled: false,
              pagingEnabled: false,
              showsHorizontalScrollIndicator: false,
              showsVerticalScrollIndicator: false,
            }}
          />
        </LongPressGestureHandler>
      )}
      <TouchableOpacity
        onPress={() => nextImage(-1)}
        style={[styles.pressableContainer, { left: 0 }]}
      />
      <TouchableOpacity
        onPress={() => nextImage(1)}
        style={[styles.pressableContainer, { right: 0 }]}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  timeBarContainer: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  gradientContainer: {
    paddingHorizontal: 7,
    paddingVertical: 10,
  },
  timeBarPlaceholder: {
    height: 4,
    marginTop: 40,
    borderRadius: 100,
    marginLeft: 2,
    zIndex: 9,
    backgroundColor: 'blue', // "rgba(255,255,255, 0.1)",
  },
  pressableContainer: {
    top: 0,
    bottom: 0,
    position: 'absolute',
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(20),
  },
  image: {
    backgroundColor: 'black',
  },
  title: {
    padding: 5,
    color: 'white',
  },
})
