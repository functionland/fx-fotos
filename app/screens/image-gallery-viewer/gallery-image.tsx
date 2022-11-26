import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import React, {
  MutableRefObject,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react'
import {
  Image,
  Platform,
  View,
  useWindowDimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Extrapolation,
} from 'react-native-reanimated'
import { SharedElement } from 'react-navigation-shared-element'
import { ScreenHeight, ScreenWidth } from '@rneui/base'
import Video from 'react-native-video'

import { Icon, Text } from '@rneui/themed'
import { palette } from '../../theme'
import { Asset, VideoPlayerMetadata, VideoPlayerProgress } from '../../types'
import { AssetService } from '../../services'
import { VideoPlayerControl } from '../../components'

type GalleryImageProps = {
  asset: Asset
  enableParentScroll?: () => void
  disableParentScroll?: () => void
  toggleMenu?: (forceValue?: boolean) => void
  listGestureRef: MutableRefObject<NativeViewGestureHandler>
  screenOpacity: SharedValue<number>
  sharedElementId: string
  isCurrentView: boolean
}

const MAX_SCALE = 6
const SWIPE_UP_THRESHOLD = 10
const SWIPE_TO_CLOSE_THRESHOLD = 100

export const GalleryImage: React.FC<GalleryImageProps> = ({
  asset,
  toggleMenu,
  enableParentScroll,
  disableParentScroll,
  listGestureRef,
  screenOpacity,
  sharedElementId,
  isCurrentView,
}) => {
  const navigation = useNavigation()
  const dims = useWindowDimensions()
  const accumulatedScale = useSharedValue(1)
  const curScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const accumulatedX = useSharedValue(0)
  const accumulatedY = useSharedValue(0)
  const bottomSheetOpacity = useSharedValue(0)
  const isImageInfoSheetOpened = useSharedValue(false)
  const isSwipeDownGestureStarted = useSharedValue(false)
  const shouldCloseOnZoomOut = useSharedValue(true)
  const panHandlerRef = useRef(null)
  const pinchHandlerRef = useRef(null)
  const doubleTapHandlerRef = useRef(null)
  const singleTapHandlerRef = useRef(null)
  const videoPlayerRef = useRef(null)
  const [videoMuted, setVideoMuted] = useState(true)
  const [videoPaused, setVideoPaused] = useState(false)
  const videoControlVisibilty = useSharedValue(false)

  const [currentVideoMetadata, setCurrentVideoMetadata] =
    useState<VideoPlayerMetadata>(null)
  const [currnetVideoProgress, setCurrnetVideoProgress] =
    useState<VideoPlayerProgress>(null)
  useEffect(() => {
    if (isCurrentView && asset?.mediaType !== 'video') {
      toggleMenu?.()
    }
  }, [])
  useEffect(() => {
    if (!isCurrentView) {
      setCurrentVideoMetadata(null)
    }
  }, [isCurrentView])

  const isZoomed = useDerivedValue(() => {
    if (accumulatedScale?.value > 1) {
      return true
    }
    return false
  }, [])

  const getXLimit = useCallback(() => {
    'worklet'

    const imageWidth = dims.width / 2
    const limit = imageWidth * accumulatedScale.value - imageWidth
    return limit
  }, [dims.width])

  const getYLimit = useCallback(() => {
    'worklet'

    const imageHeight = dims.height / 2
    const limit = imageHeight * accumulatedScale.value - imageHeight
    return limit
  }, [dims.height])

  const onTap = useCallback(() => {
    videoControlVisibilty.value = !videoControlVisibilty.value
    toggleMenu?.()
  }, [toggleMenu])

  const onDoubleTap = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onActive({ absoluteX, absoluteY }) {
      if (isImageInfoSheetOpened.value) {
        return
      }

      if (!isZoomed.value) {
        runOnJS(disableParentScroll)()
        shouldCloseOnZoomOut.value = false
        accumulatedScale.value = withTiming(MAX_SCALE)
        translateX.value = withTiming((dims.width / 2 - absoluteX) * MAX_SCALE)
        translateY.value = withTiming((dims.height / 2 - absoluteY) * MAX_SCALE)
      } else {
        runOnJS(enableParentScroll)()
        shouldCloseOnZoomOut.value = true
        accumulatedScale.value = withTiming(1)
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
      }
    },
    onFinish() {
      curScale.value = accumulatedScale.value
      accumulatedX.value = translateX.value
      accumulatedY.value = translateY.value
    },
  })

  const disableParentListScroll = useCallback(() => {
    disableParentScroll()
  }, [])

  const enableParentListScroll = useCallback(() => {
    enableParentScroll()
  }, [])

  const goBack = useCallback(() => {
    navigation.setParams({
      assetId: asset.id,
    })
    setTimeout(() => {
      navigation.goBack()
    })
  }, [asset.id])

  const onPan = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive(event) {
      if (isZoomed.value) {
        // Pan Zoomed Image.
        const newX = accumulatedX.value + event.translationX
        const newY = accumulatedY.value + event.translationY
        const xLimit = getXLimit()
        const yLimit = getYLimit()
        if (newX < xLimit && newX > -xLimit) {
          translateX.value = newX
        }
        if (newY < yLimit && newY > -yLimit) {
          translateY.value = newY
        }
      } else {
        // Handle interaction when image is zoomed out.
        const { translationX, translationY } = event

        // Left / Right Swipe started.
        if (
          !isImageInfoSheetOpened.value &&
          !isSwipeDownGestureStarted.value &&
          Math.abs(translationX) > 5
        ) {
          return
        }

        if (translationY > 0) {
          // Swipe down gesture
          // translate the image in y-axis
          if (!isImageInfoSheetOpened.value) {
            translateY.value = translationY
            accumulatedScale.value = interpolate(
              translationY,
              [0, SWIPE_TO_CLOSE_THRESHOLD],
              [1, 0.8],
              Extrapolation.CLAMP,
            )
            screenOpacity.value = interpolate(
              translationY,
              [0, SWIPE_TO_CLOSE_THRESHOLD],
              [1, 0.8],
            )
          }
          if (!isSwipeDownGestureStarted.value) {
            runOnJS(disableParentListScroll)()
            isSwipeDownGestureStarted.value = true
          }
        } else {
          // Start of Swipe up gesture
          if (!isImageInfoSheetOpened.value) {
            if (translationY < -SWIPE_UP_THRESHOLD) {
              bottomSheetOpacity.value = withTiming(1)
              translateY.value = withTiming(-200)
              runOnJS(disableParentListScroll)()
              isImageInfoSheetOpened.value = true
            }
          }
        }
      }
    },
    onFinish(event, _, isCanceledOrFailed) {
      if (isCanceledOrFailed) {
        return
      }
      const { translationY } = event
      if (isZoomed.value) {
        accumulatedX.value = translateX.value
        accumulatedY.value = translateY.value
      } else if (translationY > 0) {
        if (isImageInfoSheetOpened.value) {
          // End of swipe down gesture
          bottomSheetOpacity.value = withTiming(0)
          translateY.value = withTiming(0)
          runOnJS(enableParentListScroll)()
          isImageInfoSheetOpened.value = false
        } else if (isSwipeDownGestureStarted.value) {
          if (translationY > SWIPE_TO_CLOSE_THRESHOLD) {
            runOnJS(goBack)()
          } else {
            // Return to previous place.
            translateX.value = withTiming(accumulatedX.value)
            translateY.value = withTiming(accumulatedY.value)
            screenOpacity.value = withTiming(1)
            accumulatedScale.value = withTiming(1)
            runOnJS(enableParentListScroll)()
          }
        }
        isSwipeDownGestureStarted.value = false
      }
    },
  })

  const onPinch = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive(event) {
      if (isImageInfoSheetOpened.value) {
        return
      }
      const newScale = curScale.value * event.scale
      if (shouldCloseOnZoomOut.value && newScale < 1) {
        accumulatedScale.value = newScale
        if (newScale < 0.6) {
          screenOpacity.value = interpolate(event.scale, [0, 0.6], [0, 1])
        } else {
          screenOpacity.value = withTiming(1)
        }
      } else {
        if (newScale >= 1 && newScale <= MAX_SCALE) {
          accumulatedScale.value = newScale
        }
        if (newScale > 1) {
          shouldCloseOnZoomOut.value = false
          const xLimit = getXLimit()
          const yLimit = getYLimit()
          if (accumulatedX.value > xLimit) {
            accumulatedX.value = xLimit
            translateX.value = xLimit
          }
          if (accumulatedX.value < -xLimit) {
            accumulatedX.value = -xLimit
            translateX.value = -xLimit
          }

          if (accumulatedY.value > yLimit) {
            accumulatedY.value = yLimit
            translateY.value = yLimit
          }
          if (accumulatedY.value < -yLimit) {
            accumulatedY.value = -yLimit
            translateY.value = -yLimit
          }
        }
      }
    },
    onFinish(event, context, isCanceledOrFailed) {
      if (isImageInfoSheetOpened.value) {
        return
      }
      if (!isCanceledOrFailed) {
        const newScale = curScale.value * event.scale
        curScale.value = accumulatedScale.value

        if (shouldCloseOnZoomOut.value) {
          if (newScale < 0.6) {
            runOnJS(goBack)()
          } else {
            accumulatedScale.value = withTiming(1)
            curScale.value = 1
          }
        } else if (newScale < 1) {
          accumulatedScale.value = withTiming(1)
          curScale.value = 1
          shouldCloseOnZoomOut.value = true
        }

        if (curScale.value > 1) {
          shouldCloseOnZoomOut.value = false
          runOnJS(disableParentListScroll)()
        } else {
          shouldCloseOnZoomOut.value = true
          runOnJS(enableParentListScroll)()
        }
      }
    },
  })
  const animatedVideoControlVisibility = useAnimatedStyle(() => ({
    opacity: withTiming(videoControlVisibilty.value ? 1 : 0, { duration: 200 }),
  }))
  const animatedImageContainerStyle = useAnimatedStyle(() => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      {
        scale: accumulatedScale.value,
      },
      {
        translateX: translateX.value / accumulatedScale.value,
      },
      {
        translateY: translateY.value / accumulatedScale.value,
      },
    ],
  }))

  const animatedBottomSheetStyle = useAnimatedStyle(() => ({
    height: dims.height,
    opacity: bottomSheetOpacity.value,
  }))

  const imageStyle = useMemo(
    () => ({
      flex: 1,
      width: dims.width,
    }),
    [dims.width, dims.height],
  )

  const _onVideoLoad = useCallback(event => {
    setCurrentVideoMetadata(event)
  }, [])
  const _onVideoProgress = useCallback(event => {
    setCurrnetVideoProgress(event)
  }, [])

  return (
    <Animated.View style={styles.screenStyle}>
      <TapGestureHandler
        ref={singleTapHandlerRef}
        onActivated={onTap}
        waitFor={doubleTapHandlerRef}
        numberOfTaps={1}
      >
        <Animated.View style={styles.flex1}>
          <TapGestureHandler
            ref={doubleTapHandlerRef}
            numberOfTaps={2}
            maxDist={10}
            onGestureEvent={onDoubleTap}
            waitFor={[panHandlerRef, pinchHandlerRef]}
          >
            <Animated.View style={styles.flex1}>
              <PinchGestureHandler
                ref={pinchHandlerRef}
                onGestureEvent={onPinch}
                simultaneousHandlers={panHandlerRef}
              >
                <Animated.View style={styles.flex1}>
                  <PanGestureHandler
                    ref={panHandlerRef}
                    onGestureEvent={onPan}
                    simultaneousHandlers={[pinchHandlerRef, listGestureRef]}
                  >
                    <Animated.View style={animatedImageContainerStyle}>
                      <SharedElement id={sharedElementId}>
                        {isCurrentView && asset.mediaType === 'video' ? (
                          <Video
                            ref={videoPlayerRef}
                            source={{
                              uri:
                                Platform.OS === 'ios'
                                  ? AssetService.getIOSVideoUri(
                                      asset.uri,
                                      asset.filename,
                                    )
                                  : asset.uri,
                            }}
                            style={{
                              height: ScreenHeight,
                              width: ScreenWidth,
                            }}
                            repeat={true}
                            fullscreenAutorotate={true}
                            resizeMode="contain"
                            shouldPlay
                            paused={videoPaused}
                            muted={videoMuted}
                            onLoad={_onVideoLoad}
                            onProgress={_onVideoProgress}
                          />
                        ) : Platform.OS === 'android' ? (
                          <FastImage
                            source={{
                              uri: asset.uri,
                              priority: FastImage.priority.high,
                            }}
                            resizeMode="contain"
                            style={imageStyle}
                          />
                        ) : (
                          <Image
                            source={{
                              uri: asset.uri,
                            }}
                            fadeDuration={0}
                            resizeMode="contain"
                            style={imageStyle}
                          />
                        )}
                      </SharedElement>
                      <Animated.View
                        style={[styles.bottomSheet, animatedBottomSheetStyle]}
                      >
                        <View style={styles.handle} />
                        <Text style={styles.dateText}>
                          {moment(asset.modificationTime).format(
                            'ddd, Do MMM YYYY . h:mm',
                          )}
                        </Text>
                        <Text style={styles.heading}>Details</Text>
                        <View style={styles.detailsContainer}>
                          <Text style={styles.locationHeading}>Location:</Text>
                          <Text style={styles.uri}>{asset.uri}</Text>
                        </View>
                        {asset?.width && (
                          <View style={styles.dimensionInfoContainer}>
                            <Text style={styles.dimensionHeading}>
                              Dimensions:
                            </Text>
                            <Text style={styles.dimensionText}>
                              {asset?.width} X {asset?.height}
                            </Text>
                          </View>
                        )}
                      </Animated.View>
                    </Animated.View>
                  </PanGestureHandler>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </TapGestureHandler>
      {asset.mediaType === 'video' && (
        <VideoPlayerControl
          containerStyle={[
            { position: 'absolute', bottom: 60 },
            animatedVideoControlVisibility,
          ]}
          muted={videoMuted}
          currentTime={currnetVideoProgress?.currentTime}
          seekableDuration={currnetVideoProgress?.seekableDuration}
          onVolumePresss={() => {
            setVideoMuted(!videoMuted)
          }}
          onValueChange={value => {
            videoPlayerRef?.current?.seek(value)
          }}
        />
      )}
      {asset.mediaType === 'video' && (
        <Animated.View
          style={[styles.overlayBox, animatedVideoControlVisibility]}
          pointerEvents="box-none"
        >
          <Icon
            type="materialIcons"
            name={videoPaused ? 'play-circle-fill' : 'pause-circle-filled'}
            size={52}
            onPress={() => {
              if (videoPaused) {
                setTimeout(() => {
                  toggleMenu?.(false)
                  videoControlVisibilty.value = false
                }, 1000)
              }
              setVideoPaused(!videoPaused)
            }}
            containerStyle={{
              borderRadius: 26,
            }}
            color="rgba(255,255,255,0.6)"
            useForeground={true}
            background="black"
          />
        </Animated.View>
      )}
      {!currentVideoMetadata && asset.mediaType === 'video' && (
        <Animated.View style={[styles.overlayBox]} pointerEvents="box-none">
          <ActivityIndicator size="large" />
        </Animated.View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screenStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottomSheet: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    backgroundColor: palette.white,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    padding: 20,
    elevation: 5,
  },
  handle: {
    width: 30,
    borderRadius: 2,
    height: 4,
    opacity: 0.25,
    backgroundColor: palette.black,
    alignSelf: 'center',
    position: 'absolute',
    top: 10,
  },
  dateText: {
    color: palette.black,
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 8,
  },
  heading: {
    color: palette.black,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationHeading: {
    color: palette.black,
    fontWeight: 'bold',
  },
  uri: {
    marginLeft: 10,
    color: palette.black,
    flex: 1,
  },
  dimensionInfoContainer: {
    flexDirection: 'row',
  },
  dimensionHeading: {
    color: palette.black,
    fontWeight: 'bold',
  },
  dimensionText: {
    marginLeft: 10,
    color: palette.black,
  },
  flex1: { flex: 1, alignItems: 'center' },
  horizontalBar: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  overlayBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})
