import { Avatar } from '@rneui/themed'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
type Props = {
  iconSize?: number
  size?: ('small' | 'medium' | 'large' | 'xlarge') | number
  connected?: boolean
  onPress?: () => void
}
export function HeaderAvatar({
  size,
  iconSize,
  connected,
  onPress,
}: Props) {
  return (
        <Avatar
          containerStyle={styles.disconnectedAvatar}
          source={
            connected
              ? require('../../../assets/images/elephant.png')
              : undefined
          }
          icon={
            !connected
              ? {
                  name: 'account-alert',
                  type: 'material-community',
                  size: iconSize ?? 27,
                }
              : undefined
          }
          size={size ?? 'small'}
          rounded
          onPress={onPress}
        />
  )
}

const styles = StyleSheet.create({
  disconnectedAvatar: {
    backgroundColor: 'gray',
    marginHorizontal: 5,
    //width: 40,
    //height: 40,
    //borderRadius: 20,
    justifyContent: 'center',
  },
})
