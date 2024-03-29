import React, { useEffect, useState } from 'react'
import Animated, {
  runOnJS,
  withTiming,
  interpolate,
  Extrapolation,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import { snapPoint } from 'react-native-redash'
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native'
import {
  TapGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import * as Keychain from 'react-native-keychain'
import { RouteProp, NavigationProp } from '@react-navigation/native'

import { Buffer } from 'buffer'
import { Text } from '@rneui/themed'
import { Asset } from '../../types'
import { Constants, palette } from '../../theme'
import { Header } from '../../components'
import { HomeNavigationParamList } from '../../navigators'
import { HeaderArrowBack } from '../../components/header'
import * as helper from '../../utils/helper'

const { height, width } = Dimensions.get('window')

interface Props {
  navigation: NavigationProp<HomeNavigationParamList>
  route: RouteProp<{
    params: { section: Asset }
  }>
}

export const ShareViewerScreen: React.FC<Props> = ({ navigation, route }) => {
  const [assetURI, setAssetURI] = useState(null)
  const [loading, setLoading] = useState(false)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const imageScale = useSharedValue(1)
  const isPanGestureActive = useSharedValue(false)
  const isPinchGestureActive = useSharedValue(false)
  const animatedOpacity = useSharedValue(1)

  useEffect(() => {
    try {
      const jwe = JSON.parse(
        route.params?.jwe
          ? Buffer.from(route.params?.jwe, 'base64').toString('utf8')
          : null,
      )
      downloadFromBox(jwe)
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: 'Unable to get the shared credentials!',
        bottomOffset: 0,
        position: 'bottom',
      })
    }
    return () => {
      Toast.hide()
    }
  }, [])

  const downloadFromBox = async (jwe: string) => {
    setLoading(true)
    try {
      try {
        //await AddBoxs()
      } catch (error) {
        Alert.alert('Warning', error)
        return
      }
      let result = null
      const myDID = await helper.getMyDID()
      const fileRef = (await helper.decryptJWE(myDID?.did, jwe))?.symetricKey
      if (fileRef) {
        // result = await downloadAndDecryptAsset(fileRef)
        // setAssetURI(result.uri)
      }
    } catch (error) {
      console.log('uploadOrDownload', error)
      Toast.show({
        type: 'error',
        text1: 'Something is wrong!',
        bottomOffset: 0,
        position: 'bottom',
      })
    } finally {
      setLoading(false)
    }
  }
  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: Constants.HeaderHeight,
    backgroundColor: palette.black,
    flex: 1,
    opacity: animatedOpacity.value,
  }))

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, height],
      [1, 0.5],
      Extrapolation.CLAMP,
    )
    return {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
        { scale },
      ],
    }
  })
  const goBack = () => {
    navigation.goBack()
  }

  const onPanGesture = useAnimatedGestureHandler({
    onStart: () => {
      isPanGestureActive.value = true
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX
      translateY.value = translationY
      if (!isPinchGestureActive.value) {
        animatedOpacity.value = interpolate(
          translationY,
          [0, 400],
          [1, 0.5],
          Extrapolation.CLAMP,
        )
      }
    },
    onEnd: ({ velocityY }) => {
      if (isPinchGestureActive.value) {
        return
      }
      const shouldGoBack =
        snapPoint(translateY.value, velocityY, [0, height]) === height
      if (shouldGoBack) {
        runOnJS(goBack)()
      } else {
        translateX.value = withTiming(0, { duration: 100 })
        translateY.value = withTiming(0, { duration: 100 })
        animatedOpacity.value = interpolate(
          velocityY,
          [velocityY, 0],
          [1, 0.5],
          Extrapolation.CLAMP,
        )
      }
      isPanGestureActive.value = false
    },
  })

  const animatedImage = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }))

  const onPinchHandler =
    useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
      onStart: () => {
        if (imageScale.value === 1) {
          return
        }
        isPinchGestureActive.value = true
      },
      onActive: ({ scale }) => {
        imageScale.value = scale
        animatedOpacity.value = interpolate(
          imageScale.value,
          [1, 0.5],
          [1, 0],
          Extrapolation.CLAMP,
        )
      },
      onEnd: ({ scale }) => {
        if (scale > 1) {
          imageScale.value = scale
          return
        }
        if (scale > 0.6) {
          imageScale.value = withTiming(1, {
            duration: 100,
          })
          animatedOpacity.value = withTiming(1, {
            duration: 100,
          })
        }
        imageScale.value = scale
      },
      onFinish: ({ scale }) => {
        if (scale < 0.7) {
          runOnJS(goBack)()
        }
      },
    })

  const onDoubleTap = () => {
    if (imageScale.value === 1) {
      imageScale.value = withTiming(1.5, { duration: 150 })
    } else {
      imageScale.value = withTiming(1, {
        duration: 150,
      })
    }
  }

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text lineBreakMode="tail" h4>
          Shared asset
        </Text>
      }
      leftComponent={<HeaderArrowBack navigation={navigation} />}
    />
  )

  return (
    <PanGestureHandler
      maxPointers={1}
      minPointers={1}
      onGestureEvent={onPanGesture}
    >
      <Animated.View style={wrapperAnimatedStyle}>
        {renderHeader()}
        <Animated.View style={animatedStyle}>
          <TapGestureHandler onActivated={() => onDoubleTap()} numberOfTaps={2}>
            <View style={{ flex: 1 }}>
              <PinchGestureHandler onGestureEvent={onPinchHandler}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="large" />
                  ) : (
                    <Animated.Image
                      source={{
                        uri: assetURI,
                      }}
                      fadeDuration={0}
                      resizeMode="contain"
                      style={[styles.image, animatedImage]}
                    />
                  )}
                </View>
              </PinchGestureHandler>
            </View>
          </TapGestureHandler>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  image: {
    // ...StyleSheet.absoluteFillObject,
    height: '100%',
    width,
  },
})
