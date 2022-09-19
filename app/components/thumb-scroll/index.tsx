import React, { useEffect, useState } from 'react'

import { StyleSheet, View } from 'react-native'
import { Icon, Text, useTheme } from '@rneui/themed'

import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import Animated, {
  default as Reanimated,
  useAnimatedStyle,
  Extrapolate,
  useAnimatedGestureHandler,
  withDelay,
  withTiming,
  interpolate,
  useSharedValue,
  scrollTo,
  useAnimatedReaction,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { RecyclerAssetListSection, ViewType, GroupHeader } from '../../types'
import GridLayoutProvider from '../asset-list/grid-provider/gridLayoutProvider'

interface Props {
  hideTimeout: number
  dragY?: Reanimated.SharedValue<number>
  scrollY: Reanimated.SharedValue<number>
  viewPortHeight: number
  layoutHeight: number
  headerHeight: number
  footerHeight: number
  scrollRef?: React.RefObject<Animated.ScrollView>
  showYearFilter?: boolean
  sections?: RecyclerAssetListSection[]
  layoutProvider?: GridLayoutProvider
}
export const ThumbScroll: React.FC<Props> = props => {
  const opacity = useSharedValue<number>(1)
  const [yearIndices, setYearIndices] = useState<number[]>([])
  const [dragging, setDragging] = useState(false)
  const { theme } = useTheme()
  Reanimated.addWhitelistedNativeProps({
    text: true,
  })
  useEffect(() => {
    if (props.showYearFilter && props.sections) {
      const indices = []
      let lastYear = null

      // Prepare the year filter indices
      for (let index = 0; index < props.sections.length; index++) {
        const item = props.sections[index]
        if (item.type === ViewType.DAY) {
          const data = item.data as GroupHeader
          if (!lastYear || (data.date && data.date.getFullYear() != lastYear)) {
            indices.push(index)
            lastYear = data.date?.getFullYear()
          }
        }
      }
      setYearIndices(indices)
    }
  }, [props.sections])
  const _onPanGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { prevScrollY: number }
  >({
    onStart: (_, ctx) => {
      opacity.value = withTiming(1, {
        duration: 1000,
      })
      ctx.prevScrollY = props.scrollY.value
      runOnJS(setDragging)(true)
    },
    onActive: (event, ctx) => {
      const diff =
        ctx.prevScrollY +
        (event.translationY * props.layoutHeight) / props.viewPortHeight
      if (props.dragY) props.dragY.value = diff

      scrollTo(props.scrollRef, 0, diff, false)
    },
    onEnd: () => {
      opacity.value = withDelay(
        props.hideTimeout,
        withTiming(0, { duration: 0 }),
      )
      runOnJS(setDragging)(false)
    },
    onCancel: () => {
      opacity.value = withDelay(
        props.hideTimeout,
        withTiming(0, { duration: 0 }),
      )
      runOnJS(setDragging)(false)
    },
    onFail: () => {
      opacity.value = withDelay(
        props.hideTimeout,
        withTiming(0, { duration: 0 }),
      )
      runOnJS(setDragging)(false)
    },
    onFinish: () => {
      opacity.value = withDelay(
        props.hideTimeout,
        withTiming(0, { duration: 0 }),
      )
      runOnJS(setDragging)(false)
    },
  })
  useAnimatedReaction(
    () => props.scrollY.value,
    () => {
      if (opacity.value === 0) opacity.value = 1
      else
        opacity.value = withDelay(
          props.hideTimeout,
          withTiming(0, { duration: 0 }),
        )
    },
    [],
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          props.scrollY.value, //* (props.viewPortHeight / (props.layoutHeight - props.viewPortHeight)),
          [0, props.layoutHeight],
          [props.headerHeight, props.viewPortHeight - props.footerHeight],
          Extrapolate.CLAMP,
        ),
      },
      {
        translateX: withTiming(
          interpolate(opacity.value, [0, 1], [60, 0], Extrapolate.CLAMP),
          {
            duration: 500,
          },
        ),
      },
    ],
  }))
  const renderYearFilter = () => {
    let lastItemY = 0
    let lastYIndex = 0
    return (
      <Reanimated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        {yearIndices.map((sectionIndex, index) => {
          const section = props.sections[sectionIndex]
          const layout = props.layoutProvider
            ?.getLayoutManager()
            ?.getLayouts()?.[sectionIndex]
          if (!section?.data || !layout) return null
          const data = section.data as GroupHeader
          const tY =
            interpolate(
              layout.y + props.viewPortHeight / 2, // * (props.viewPortHeight / (props.layoutHeight - props.viewPortHeight)),
              [0, props.layoutHeight],
              [props.headerHeight, props.viewPortHeight - props.footerHeight],
              Extrapolate.CLAMP,
            ) + 10

          // If years overlap then will increase the lastYIndex
          if (lastItemY + 20 >= tY) lastYIndex++
          else lastYIndex = 0
          lastItemY = tY
          return (
            <Text
              key={index}
              style={[
                {
                  right: 80,
                  transform: [
                    {
                      translateY: tY + lastYIndex * 20,
                    },
                  ],
                },
                styles.yearFilterText,
              ]}
            >
              {data?.date.getFullYear()}
            </Text>
          )
        })}
      </Reanimated.View>
    )
  }
  if (!props.viewPortHeight || !props.layoutHeight) return null
  return (
    <Reanimated.View style={styles.scrollIndicatorContainer}>
      {dragging ? renderYearFilter() : null}
      <PanGestureHandler
        onGestureEvent={_onPanGestureEvent}
        maxPointers={1}
        minPointers={1}
        shouldCancelWhenOutside={false}
        avgTouches={false}
        enableTrackpadTwoFingerGesture={false}
      >
        <Reanimated.View style={[styles.scrollIndicator, animatedStyle]}>
          <View
            style={[
              styles.scrollBar,
              {
                backgroundColor: theme.colors.grey4,
              },
            ]}
          >
            <Icon type="font-awesome" name="sort" />
          </View>
        </Reanimated.View>
      </PanGestureHandler>
    </Reanimated.View>
  )
}

const styles = StyleSheet.create({
  scrollIndicatorContainer: {
    top: 0,
    position: 'absolute',
    right: 0,
    width: 60,
    height: 50,
    opacity: 1,
    zIndex: 99,
  },
  scrollIndicator: {
    flex: 1,
  },
  image: {
    marginLeft: 12,
    height: 20,
    width: 10,
    marginTop: 15,
  },
  scrollBar: {
    position: 'absolute',
    right: -20,
    borderRadius: 50,
    backgroundColor: 'whitesmoke',
    height: 50,
    width: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    paddingRight: 15,
  },
  yearFilterText: {
    top: 0,
    backgroundColor: 'gray',
    opacity: 0.8,
    padding: 1,
    paddingHorizontal: 5,
    borderRadius: 10,
    position: 'absolute',
    color: 'white',
  },
})
