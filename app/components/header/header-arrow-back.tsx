import React from 'react'
import { Icon, IconProps } from '@rneui/themed'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

interface Props {
  iconProps?: IconProps
  navigation?: NativeStackNavigationProp<unknown, unknown>
}

export function HeaderArrowBack({ iconProps, navigation }: Props) {
  return (
    <Icon
      type="Ionicons"
      name="arrow-back"
      size={28}
      {...iconProps}
      style={{ marginTop: 3 }}
      onPress={() => {
        navigation?.pop()
      }}
      {...iconProps}
    />
  )
}
