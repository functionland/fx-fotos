import React, { FC, useEffect, useState } from "react"
import { StyleSheet, Text, Alert, View } from "react-native"
import * as MediaLibrary from "expo-media-library"
import { Button, Screen } from "../../components"
import { AssetService } from "../../services"
import { NavigatorParamList } from "../../navigators"
import { color } from "../../theme"
import AssetList from "../../components/asset-list"
import { RecyclerAssetListSection } from "../../types"
import { useFloatHederAnimation } from "../../utils/hooks"
import { palette } from "../../theme/palette"
import { StackNavigationProp } from "@react-navigation/stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/HomeNavigation"

interface HomeScreenProps {
  navigation: StackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [assets, setAssets] = useState<RecyclerAssetListSection[]>(null)
  const [isReady, setIsReady] = useState(false)

  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)

  const requestAndroidPermission = async () => {
    try {
      console.log("requestAndroidPermission")
      await MediaLibrary.requestPermissionsAsync(true)
    } catch (err) {
      Alert.alert("Request permission", JSON.stringify(err))
      console.warn(err)
    } finally {
      setIsReady(true)
    }
  }
  useEffect(() => {
    requestAndroidPermission()
  }, [])

  useEffect(() => {
    if (isReady) prepareAssets()
  }, [isReady])
  const prepareAssets = async () => {
    console.log("prepareAssets")
    try {
      const allMedias = await AssetService.getAllMedias()
      setAssets(AssetService.categorizeAssets(allMedias.assets))
    } catch (error) {
      console.error("prepareAssets:", error)
    }
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
      backgroundColor={color.transparent}
    >
      {!assets ? (
        <Text style={styles.loadingText}>Loading photos...</Text>
      ) : !assets?.length ? (
        <Text style={styles.emptyText}>Gallery is empty!</Text>
      ) : (
        <AssetList sections={assets} scrollY={scrollY} navigation={navigation} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "800",
  },
  loadingText: {
    alignSelf: "center",
    color: palette.lightGrey,
    fontSize: 24,
    fontWeight: "800",
  },
  screen: {
    backgroundColor: palette.white,
    flex: 1,
    justifyContent: "center",
  },
})
