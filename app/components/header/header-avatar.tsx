import { Avatar } from '@rneui/themed'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import {
  WalletConnectModal,
  useWalletConnectModal,
} from '@walletconnect/modal-react-native'
import { WalletConnectConifg } from '../../utils'
type Props = {
  iconSize?: number
  size?: ('small' | 'medium' | 'large' | 'xlarge') | number
  onPress?: () => void
}
export function HeaderAvatar({ size, iconSize, onPress }: Props) {
  const { isConnected, provider } = useWalletConnectModal()
  return (
    <>
      {provider || isConnected ? (
        <Avatar
          containerStyle={styles.disconnectedAvatar}
          icon={{
            name: isConnected ? 'wallet' : 'account-alert',
            type: 'material-community',
            size: iconSize ?? 27,
          }}
          size={size ?? 'small'}
          rounded
          onPress={onPress}
        />
      ) : (
        <ActivityIndicator />
      )}
      <WalletConnectModal
        projectId={WalletConnectConifg.WaletConnect_Project_Id}
        providerMetadata={WalletConnectConifg.providerMetadata}
        sessionParams={WalletConnectConifg.sessionParams()}
      />
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
