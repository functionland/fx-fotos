import { Avatar } from '@rneui/themed'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
type Props = {
  iconSize?: number
  size?: ('small' | 'medium' | 'large' | 'xlarge') | number
  connected?: boolean
  provider?: any
  onPress?: () => void
}
export function HeaderAvatar({
  size,
  iconSize,
  connected,
  provider,
  onPress,
}: Props) {
  return (
    <>
      {provider || connected ? (
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
      ) : (
        <ActivityIndicator />
      )}
    </>
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
