import React from 'react'
import { Icon, Text } from '@rneui/themed'
import { View, StyleSheet } from 'react-native'

export const DeletedAssetTemplate = () => {
  return (
    <View style={styles.container}>
      <Icon name="delete-variant" type="material-community" size={100}></Icon>
      <Text style={styles.text}>
        This asset is deleted but it is availble on the Blox
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  text: {
    padding: 10,
    textAlign: 'center',
  },
})
