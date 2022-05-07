import React, { useEffect, useRef, useState, useContext } from "react"
import { StyleSheet, Alert, View, Image } from "react-native"
import * as MediaLibrary from "expo-media-library"
import LottieView from "lottie-react-native"
import { useRecoilState } from "recoil"
import { Icon, Switch, Text, useTheme } from "@rneui/themed"

import { Screen } from "../../components"
import { AssetService } from "../../services"
import AssetList, { AssetListHandle } from "../../components/asset-list"
import { useFloatHederAnimation } from "../../utils/hooks"
import { palette } from "../../theme/palette"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { mediasState, recyclerSectionsState } from "../../store"
import { Assets } from "../../services/localdb"
import { Entities } from "../../realmdb"
import { Header } from "../../components/header"
import { ThemeContext } from "../../theme"
interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isReady, setIsReady] = useState(false)
  const realmAssets = useRef<Realm.Results<Entities.AssetEntity & Realm.Object>>(null);
  const [medias, setMedias] = useRecoilState(mediasState)
  const [recyclerSections, setRecyclerSections] = useRecoilState(recyclerSectionsState);
  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<stringp[]>([]);
  const assetListRef = useRef<AssetListHandle>()
  const { toggleTheme } = useContext(ThemeContext);
  const { theme , updateTheme} = useTheme();
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
    requestAndroidPermission();

    // remove listener after screen disposed
    return () => {
      if (realmAssets.current) {
        realmAssets.current.removeAllListeners();
      }
    }
  }, [])


  useEffect(() => {
    if (isReady) {
      (async () => {
        realmAssets.current = await Assets.getAll();
        const assets = []
        for (const asset of realmAssets.current) {
          assets.push(asset)
        }
        setMedias(assets)
        realmAssets.current.addListener(onLocalDbAssetChange)
        await syncAssets(assets.length ? assets?.[0].modificationTime : 0)
      })();
    }
  }, [isReady])

  useEffect(() => {
    if (medias && medias.length)
      setRecyclerSections([...AssetService.categorizeAssets([...medias])]);
  }, [medias])

  const onLocalDbAssetChange = (collection: Realm.Collection<Entities.AssetEntity>, changes: Realm.CollectionChangeSet) => {
    setMedias(prev => {
      let assets = [...prev];
      if (changes.deletions?.length) {
        assets = assets.filter((_, index) => !changes.deletions.some(i => i === index))
        return [...assets]
      }
      if (changes.insertions?.length) {
        changes.insertions.map(index => {
          assets.push(collection[index])
        })
        return assets;
      }
      return prev
    })
  }

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
            try {
              const deleted = await AssetService.deleteAssets(selectedItems);
              if (deleted) {
                setMedias(prev => {
                  return prev.filter(item => !selectedItems.some(selectedId => selectedId === item.id))
                })
                assetListRef?.current?.resetSelectedItems();
                await Assets.remove(selectedItems);
                cancelSelectionMode()
              }
            } catch (error) {
              console.log("deleteAssets: ", error)
            }

          }
        }
      ]
    )
  }

  const syncAssets = async (lastTime = 0) => {
    try {
      let first = 20
      let allMedias: MediaLibrary.PagedInfo<MediaLibrary.Asset> = null
      let lastAsset: MediaLibrary.Asset = null;
      do {
        allMedias = await AssetService.getAssets(first, allMedias?.endCursor)
        await Assets.addOrUpdate(allMedias.assets);
        if (!allMedias.hasNextPage) break
        first = first * 4
        lastAsset = allMedias.assets?.[allMedias.assets.length - 1];
      } while (!allMedias.hasNextPage && lastAsset.modificationTime < lastTime)
    } catch (error) {
      console.error("syncAssets:", error)
    }
  }

  const onAssetLoadError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (error?.nativeEvent?.error) {
      // Error is something like "/storage/emulated/0/DCIM/Camera/20220501_200313.jpg: open failed: ENOENT (No such file or directory)"
      const errorParts = (error.nativeEvent.error as string)?.split(':');
      if (errorParts?.[1]?.includes("open failed")) {
        console.log("onAssetLoadError:", errorParts?.[0])
        Assets.removeByUri(errorParts?.[0].trim())
      }
    }
  }

  const onSelectedItemsChange = (assetIds: string[], selectionMode: boolean) => {
    setSelectionMode(selectionMode);
    setSelectedItems(assetIds);
  }
  const renderHeader = () => {
    if (selectionMode) {
      return (<Header
        style={headerStyles}
        centerComponent={{ text: "" }}
        leftComponent={<View style={styles.headerLeftContainer}>
          <Icon type="material-community" name="close" onPress={cancelSelectionMode} />
          <Text style={{ fontSize: 16, marginStart: 20 }}>{selectedItems?.length}</Text>
        </View>}
        rightComponent={<View style={styles.headerRightContainer}>
          <Icon type="material-community" name="delete" onPress={() => deleteAssets("delete")} />
        </View>}
      />)
    }
    else {
      return (<Header
        style={headerStyles}
        centerComponent={<Image
          style={styles.logo}
          fadeDuration={0}
          resizeMode="contain"
          source={require("../../../assets/images/logo.png")}
        />}
        leftComponent={<View style={styles.headerLeftContainer}>
          <Switch value={theme.mode != "dark"} onValueChange={(value) => {
            toggleTheme()
          }} />
          <Icon type="material-community" name="white-balance-sunny" />
        </View>}
      />)
    }
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
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
          navigation={navigation}
          onAssetLoadError={onAssetLoadError}
        />
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
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
  },
  subheaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    height: 30,
    alignSelf: "center",
    backgroundColor: "transparent"
  },
})