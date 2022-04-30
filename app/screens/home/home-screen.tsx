import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, Alert, View } from "react-native"
import * as MediaLibrary from "expo-media-library"
import LottieView from "lottie-react-native"
import { useRecoilState } from "recoil"

import { Screen } from "../../components"
import { AssetService } from "../../services"
import { color } from "../../theme"
import AssetList, { AssetListHandle } from "../../components/asset-list"
import { useFloatHederAnimation } from "../../utils/hooks"
import { palette } from "../../theme/palette"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { mediasState, recyclerSectionsState } from "../../store"
import { Icon, Text } from "react-native-elements"
import { Assets } from "../../services/localdb"
interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isReady, setIsReady] = useState(false)
  const [medias, setMedias] = useRecoilState(mediasState)
  const [recyclerSections, setRecyclerSections] = useRecoilState(recyclerSectionsState);
  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<stringp[]>([]);
  const assetListRef = useRef<AssetListHandle>()
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
    if (selectionMode) {
      navigation.setOptions({
        headerTitle: () => null,
        headerStyle: [styles.selectModeHeader],
        headerLeft: () =>
          <View style={styles.headerLeftContainer}>
            <Icon type="material-community" name="close" onPress={cancelSelectionMode} />
            <Text style={{ fontSize: 16, marginStart: 20 }}>{selectedItems?.length}</Text>
          </View>,
        headerRight: () =>
          <View style={styles.headerRightContainer}>
            <Icon type="material-community" name="delete" onPress={() => deleteAssets("delete")} />
          </View>
      })
    }
    else {
      navigation.setOptions({
        headerTitle: null,
        headerLeft: () => null,
        headerRight: () => null,
        headerStyle: [headerStyles],
      })
    }
  }, [selectionMode, selectedItems])
  useEffect(() => {

    if (isReady) {
      (async () => {
        const ass = await Assets.getAll();
        setMedias(prev => {
          return [...prev, ...ass]
        })
        //prepareAssets()
        console.log("localdb assets", ass.length,ass.length?ass[0]:"")
      })();


    }
  }, [isReady])

  const cancelSelectionMode = () => {
    assetListRef?.current?.toggleSelectionMode();
  }

  const deleteAssets = () => {
    Alert.alert("Delete", "Are you sure want to delete these assets?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            const deleted = await AssetService.deleteAssets(selectedItems);
            if (deleted) {
              setMedias(prev => {
                return prev.filter(item => !selectedItems.some(selectedId => selectedId === item.id))
              })
              assetListRef?.current?.resetSelectedItems();
            }
          }
        }
      ]
    )
  }
  const prepareAssets = async () => {
    try {
      let first = 20
      let allMedias: MediaLibrary.PagedInfo<MediaLibrary.Asset> = null
      do {
        allMedias = await AssetService.getAssets(first, allMedias?.endCursor)
        setMedias(prev => {
          return [...prev, ...allMedias.assets]
        })
        Assets.addOrUpdate(allMedias.assets);
        if (!allMedias.hasNextPage) break
        first = first * 4
      } while (true && first < 80)
    } catch (error) {
      console.error("prepareAssets:", error)
    }
  }
  useEffect(() => {
    if (medias && medias.length)
      setRecyclerSections([...AssetService.categorizeAssets([...medias])]);
  }, [medias])
  const onSelectedItemsChange = (assetIds: string[], selectionMode: boolean) => {
    console.log("onSelectedItemsChange:", assetIds, selectionMode)
    setSelectionMode(selectionMode);
    setSelectedItems(assetIds);
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
      backgroundColor={color.transparent}
    >
      {!recyclerSections ? (
        <View style={styles.loaderContainer}>
          <LottieView
            autoPlay={true}
            loop={true}
            source={require("../../../assets/lotties/photo-loading.json")}
          />
          <Text style={styles.loadingText}>Gathering photos</Text>
        </View>
      ) : !recyclerSections?.length ? (
        <Text style={styles.emptyText}>Gallery is empty!</Text>
      ) : (
        <AssetList
          ref={assetListRef}
          sections={recyclerSections}
          scrollY={scrollY}
          onSelectedItemsChange={onSelectedItemsChange}
          navigation={navigation} />
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
    fontSize: 16,
    marginTop: 250,
  },
  screen: {
    backgroundColor: palette.white,
    flex: 1,
    justifyContent: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  headerLeftContainer: {
    flex: 1,
    flexDirection: "row",
    paddingStart: 5
  },
  headerRightContainer: {
    flex: 1,
    flexDirection: "row",
    paddingEnd: 5
  },
  selectModeHeader: {
    transform: [{
      translateY: 0
    }]
  }
})