import React, { useEffect, useRef, useState } from 'react'
import { RouteProp, useNavigation } from '@react-navigation/native'
import {
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  InteractionManager,
} from 'react-native'
import {
  LongPressGestureHandler,
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import Animated, {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
  withDelay,
} from 'react-native-reanimated'
import { snapPoint } from 'react-native-redash'
import FastImage from 'react-native-fast-image'
import { useRecoilState } from 'recoil'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import { SharedElement } from 'react-navigation-shared-element'
import { Asset, AssetStory, ViewType } from '../../types'
import { recyclerSectionsState, selectedStoryState } from '../../store'
import { Screen } from '../../components'
import { Highlights } from './highlights'
import deviceUtils from '../../utils/deviceUtils'

interface HighlightScreenProps {
  route: RouteProp<
    {
      params: {
        highlights: AssetStory
      }
    },
    'params'
  >
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')
export const HighlightScreen: React.FC<HighlightScreenProps> = ({ route }) => {
  const navigation = useNavigation()
  const gestureHanlderRef = useRef<NativeViewGestureHandler>()
  const panGestureRef = useRef<PanGestureHandler>()
  const carouselRef = useRef<ICarouselInstance>()
  const [selectedStory] = useRecoilState(selectedStoryState)
  const pauseTimeProgress = useSharedValue(false)
  const sharedElementOpacity = useSharedValue(1)

  const longPressRef = useRef<LongPressGestureHandler>()

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const animatedOpacity = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)

  const goBack = () => {
    sharedElementOpacity.value = 1
    navigation.goBack()
  }

  const PAGE_WIDTH = deviceUtils.dimensions.width
  const PAGE_HEIGHT = deviceUtils.dimensions.height

  const selectedStoryData = selectedStory?.data.slice(0, 40)
  const [recyclerSections] = useRecoilState(recyclerSectionsState)
  const [stories] = useState<AssetStory[]>(
    recyclerSections?.[0].type === ViewType.STORY
      ? recyclerSections?.[0].data
      : [],
  )
  const [currentIndex, setCurrentIndex] = useState(
    stories.findIndex(story => story.id === selectedStory.id),
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

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, screenHeight],
      [1, 0.9],
      Extrapolate.CLAMP,
    )
    return {
      flex: 1,
      transform: [
        {
          translateY: translateY.value,
        },
        { scale },
      ],
    }
  }, [])

  const sharedElementConatinerStyle = useAnimatedStyle(() => {
    return {
      opacity: sharedElementOpacity.value,
    }
  }, [])
  const onPanGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>(
    {
      onActive({ translationX, translationY }) {
        isPanGestureActive.value = true
        translateX.value = translationX
        translateY.value = translationY
        if (!isPinchGestureActive.value) {
          animatedOpacity.value = interpolate(
            translationY,
            [0, 400],
            [1, 0.5],
            Extrapolate.CLAMP,
          )
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
          translateX.value = withTiming(0, {
            duration: 100,
          })
          translateY.value = withTiming(0, {
            duration: 100,
          })
          animatedOpacity.value = interpolate(
            velocityY,
            [velocityY, 0],
            [1, 0.5],
            Extrapolate.CLAMP,
          )
        }
        isPanGestureActive.value = false
      },
    },
  )

  useAnimatedReaction(
    () => isPanGestureActive.value,
    isGestureActive => {
      if (isGestureActive) {
        pauseTimeProgress.value = true
        return
      }
      pauseTimeProgress.value = false
    },
    [],
  )
  // const PESPECTIVE = Platform.OS === 'ios' ? 2.38 : 1.7
  // const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.5

  const animationStyle: TAnimationStyle = React.useCallback((value: number) => {
    'worklet'

    const translateX = interpolate(
      value,
      [-1, 0, 1],
      [-PAGE_WIDTH, 0, PAGE_WIDTH],
    )
    const rotateY = interpolate(value, [-1, 0, 1], [-45, 0, 45])
    const zIndex = interpolate(value, [-1, 0, 1], [300, 0, -300])

    const scale = interpolate(value, [-1, 0, 1], [0.65, 1, 0.65])

    return {
      transform: [
        { perspective: PAGE_WIDTH },
        { translateX },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      zIndex,
    }
  }, [])

  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      sharedElementOpacity.value = 0
      console.log('sharedElementOpacity.value', sharedElementOpacity.value)
    })

    return () => {
      interactionPromise.cancel()
    }
  }, [])
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <NativeViewGestureHandler ref={gestureHanlderRef}>
        <Animated.View style={[containerAnimatedStyle]}>
          <PanGestureHandler
            ref={panGestureRef}
            waitFor={[longPressRef]}
            maxPointers={1}
            minPointers={1}
            onGestureEvent={onPanGesture}
            failOffsetX={300}
            activeOffsetX={[-100, 100]}
            activeOffsetY={[-100, 100]}
          >
            <Animated.View>
              <Animated.View style={sharedElementConatinerStyle}>
                <SharedElement
                  id={selectedStory.id}
                  style={{
                    position: 'absolute',
                  }}
                >
                  {_rowRenderer(null, selectedStoryData?.[0], 0)}
                </SharedElement>
              </Animated.View>

              <Animated.View>
                <Carousel
                  ref={carouselRef}
                  style={{
                    backgroundColor: '#212121',
                  }}
                  defaultIndex={currentIndex}
                  loop={false}
                  width={deviceUtils.dimensions.width}
                  height={deviceUtils.dimensions.height}
                  autoPlay={false}
                  data={stories.map((_, i) => i)}
                  scrollAnimationDuration={600}
                  onSnapToItem={index => {
                    setCurrentIndex(index)
                  }}
                  renderItem={({ index, animationValue }) => (
                    <Highlights
                      key={index}
                      animationValue={animationValue}
                      assets={stories[index]?.data}
                      active={
                        index === currentIndex ||
                        index === currentIndex - 1 ||
                        index === currentIndex + 1
                      }
                      title={stories[index]?.title}
                      paused={index != currentIndex}
                      onNextStory={direction => {
                        if (
                          carouselRef.current?.getCurrentIndex() >=
                            stories?.length - 1 &&
                          direction === 'next'
                        ) {
                          goBack()
                        }
                        if (direction === 'next') carouselRef.current?.next()
                        else carouselRef.current?.prev()
                      }}
                      index={index}
                    />
                  )}
                  panGestureHandlerProps={{
                    activeOffsetX: [-50, 50],
                  }}
                  customAnimation={animationStyle}
                />
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </NativeViewGestureHandler>
    </Screen>
  )
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'black',
  },
})
