import React from 'react'

import { StyleSheet, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated, { SlideInUp } from 'react-native-reanimated'
import { Chip, useTheme } from '@rneui/themed'
import moment from 'moment'
import { SearchOptionType, SearchOptionValueType } from '../../types'

interface Props {
  onOptionsPress?: (optionValue: SearchOptionValueType) => void
  selectedOptions?: SearchOptionValueType[]
  style: ViewStyle
}
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
export const SearchOptionsList = ({
  selectedOptions,
  onOptionsPress,
  style,
}: Props) => {
  const { theme } = useTheme()
  const optionsObj: Record<string, OptionsList> = SearchOptions.reduce(
    (obj, option) => {
      obj[option.order] = option
      return obj
    },
    {},
  )
  const selectedOptionsObj: Record<string, SearchOptionValueType> =
    selectedOptions?.reduce((obj, option) => {
      obj[option.id] = option
      return obj
    }, {})
  console.log('SearchOptions', SearchOptions)
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={[{ backgroundColor: theme.colors.background }, style]}
    >
      {Object.values(optionsObj).map((optionList, index) => (
        <AnimatedScrollView
          entering={SlideInUp.duration(600).delay(index * 0)}
          key={optionList.order}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {optionList.searchOptions?.map(option =>
            SearchOptionClip({
              option,
              titleStyle: { color: theme.colors.greyOutline },
              buttonStyle: [
                {
                  borderColor: theme.colors.greyOutline,
                },
                selectedOptionsObj?.[option.id]
                  ? { backgroundColor: theme.colors.grey0 }
                  : {},
              ],
              disabled: !!selectedOptionsObj?.[option.id],
              onOptionsPress,
            }),
          )}
        </AnimatedScrollView>
      ))}
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  clipContainerStyle: {
    marginVertical: 10,
    marginHorizontal: 4,
    borderRadius: 15,
  },
  clipButtonStyle: {
    borderWidth: 1,
    padding: 5,
  },
})
export interface SearchOptionClipProps {
  option: SearchOptionValueType
  onOptionsPress?: (option: SearchOptionValueType) => void
  titleStyle?: ViewStyle
  buttonStyle?: ViewStyle
  containerStyle?: ViewStyle
  disabled?: boolean
}
export const SearchOptionClip = ({
  option,
  onOptionsPress,
  titleStyle,
  buttonStyle,
  containerStyle,
  disabled,
}: SearchOptionClipProps) => {
  switch (option.type) {
    case 'AssetDateRange':
      return (
        <Chip
          key={option.id}
          title={option.title}
          disabled={disabled}
          titleStyle={[titleStyle]}
          type="outline"
          containerStyle={[styles.clipContainerStyle, containerStyle]}
          buttonStyle={[styles.clipButtonStyle, buttonStyle]}
          icon={{
            name: 'calendar',
            type: 'font-awesome',
            size: 18,
            color: '#42a5f5',
          }}
          onPress={() => onOptionsPress?.(option)}
        />
      )
    case 'AssetType':
      return (
        <Chip
          key={option.id}
          title={option.title}
          titleStyle={[titleStyle]}
          type="outline"
          containerStyle={[styles.clipContainerStyle, containerStyle]}
          buttonStyle={[styles.clipButtonStyle, buttonStyle]}
          icon={{
            name: option.icon,
            type: 'font-awesome',
            size: 18,
            color: '#f9a825',
          }}
          onPress={() => onOptionsPress?.(option)}
        />
      )
    case 'AssetMime':
      return (
        <Chip
          key={option.id}
          title={option.title}
          titleStyle={[titleStyle]}
          type="outline"
          containerStyle={[styles.clipContainerStyle, containerStyle]}
          buttonStyle={[styles.clipButtonStyle, buttonStyle]}
          icon={{
            name: option.icon,
            type: 'font-awesome',
            size: 18,
            color: '#f4511e',
          }}
          onPress={() => onOptionsPress?.(option)}
        />
      )
    case 'AssetDuration':
      return (
        <Chip
          key={option.id}
          title={option.title}
          titleStyle={[titleStyle]}
          type="outline"
          containerStyle={[styles.clipContainerStyle, containerStyle]}
          buttonStyle={[styles.clipButtonStyle, buttonStyle]}
          icon={{
            name: option.icon,
            type: 'material-community',
            size: 18,
            color: '#4caf50',
          }}
          onPress={() => onOptionsPress?.(option)}
        />
      )
    default:
      break
  }
}
type OptionsList = {
  order: number
  type: SearchOptionType
  searchOptions: SearchOptionValueType[]
}
const SearchOptions: OptionsList[] = [
  {
    order: 0,
    type: 'AssetDateRange',
    searchOptions: [
      {
        id: '7 days ago',
        title: '7 days ago',
        type: 'AssetDateRange',
        icon: 'calendar',
        value: moment().add(-7, 'days').toDate().getTime(),
      },
      {
        id: '1 month ago',
        title: '1 month ago',
        type: 'AssetDateRange',
        icon: 'calendar',
        value: moment().add(-1, 'months').toDate().getTime(),
      },
      {
        id: '3 month ago',
        title: '3 month ago',
        type: 'AssetDateRange',
        icon: 'calendar',
        value: moment().add(-3, 'months').toDate().getTime(),
      },
      {
        id: '6 month ago',
        title: '6 month ago',
        type: 'AssetDateRange',
        icon: 'calendar',
        value: moment().add(-6, 'months').toDate().getTime(),
      },
    ],
  },
  {
    order: 1,
    type: 'AssetType',
    searchOptions: [
      {
        id: 'Images',
        title: 'Images',
        value: 'photo',
        type: 'AssetType',
        icon: 'file-photo-o',
      },
      {
        id: 'Videos',
        title: 'Videos',
        value: 'video',
        type: 'AssetType',
        icon: 'video-camera',
      },
    ],
  },
  {
    order: 2,
    type: 'AssetMime',
    searchOptions: [
      {
        id: 'PNG',
        title: 'PNG',
        value: 'image/png',
        type: 'AssetMime',
        icon: 'photo',
      },
      {
        id: 'JPEG',
        title: 'JPEG',
        value: 'image/jpeg',
        type: 'AssetMime',
        icon: 'photo',
      },
      {
        id: 'GIF',
        title: 'GIF',
        value: 'image/gif',
        type: 'AssetMime',
        icon: 'photo',
      },
      {
        id: 'MP4',
        title: 'MP4',
        value: 'image/mp4',
        type: 'AssetMime',
        icon: 'file-video-o',
      },
    ],
  },
  {
    order: 3,
    type: 'AssetDuration',
    searchOptions: [
      {
        id: 'More than 30s',
        title: 'More than 30s',
        value: 30,
        type: 'AssetDuration',
        icon: 'clock-time-ten-outline',
      },
      {
        id: 'More than 60s',
        title: 'More than 60s',
        value: 60,
        type: 'AssetDuration',
        icon: 'clock-time-ten-outline',
      },
      {
        id: 'More than 5min',
        title: 'More than 5min',
        value: 5 * 60,
        type: 'AssetDuration',
        icon: 'clock-time-ten-outline',
      },
      {
        id: 'More than 30 mins',
        title: 'More than 30 mins',
        value: 30 * 60,
        type: 'AssetDuration',
        icon: 'clock-time-ten-outline',
      },
      {
        id: 'More than 60 mins',
        title: 'More than 60 mins',
        value: 60 * 60,
        type: 'AssetDuration',
        icon: 'clock-time-ten-outline',
      },
    ],
  },
]
