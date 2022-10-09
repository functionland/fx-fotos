import React, { useEffect, useState } from 'react'

import { StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Chip } from '@rneui/themed'
import { SearchOptionType, SearchOptionValueType } from '../../types'

interface Props {
  onOptionsPress?: (optionValue: SearchOptionValueType) => void
  selectedOptions?: SearchOptionValueType[]
}
export const SearchOptionsList = ({
  selectedOptions,
  onOptionsPress,
}: Props) => {
  const optionsObj: Record<string, OptionsList> = SearchOptions.reduce(
    (obj, option) => {
      obj[option.order] = option
      return obj
    },
    [],
  )
  const selectedOptionsObj: Record<string, SearchOptionValueType> =
    selectedOptions?.reduce((obj, option) => {
      obj[option.id] = option
      return obj
    }, {})

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {Object.values(optionsObj).map(optionList => (
        <ScrollView
          key={optionList.order}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {optionList.searchOptions?.map(option => {
            return (
              <Chip
                key={option.id}
                title={option.title}
                type="outline"
                containerStyle={{ marginVertical: 15 }}
                icon={{
                  name: 'bluetooth',
                  type: 'font-awesome',
                  size: 20,
                  color: 'white',
                }}
              />
            )
          })}
        </ScrollView>
      ))}
    </ScrollView>
  )
}
const styles = StyleSheet.create({})

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
      },
      {
        id: '1 month ago',
        title: '1 month ago',
        type: 'AssetDateRange',
        icon: 'calendar',
      },
      {
        id: '3 month ago',
        title: '3 month ago',
        type: 'AssetDateRange',
        icon: 'calendar',
      },
      {
        id: '6 month ago',
        title: '3 month ago',
        type: 'AssetDateRange',
        icon: 'calendar',
      },
    ],
  },
  {
    order: 1,
    type: 'AssetType',
    searchOptions: [
      {
        id: 'Video',
        title: 'Video',
        value: 'video',
        type: 'AssetType',
        icon: 'video',
      },
      {
        id: 'Image',
        title: 'Image',
        value: 'photo',
        type: 'AssetType',
        icon: 'photos',
      },
    ],
  },
]
