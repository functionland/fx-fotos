import React, { useEffect, useRef, useState, useContext } from "react"
import { StyleSheet, Alert, View, Image, ActivityIndicator } from "react-native"
import LottieView from "lottie-react-native"
import { Avatar, Icon, Text, useTheme } from "@rneui/themed"
import Toast from "react-native-toast-message"
import { useWalletConnect } from "@walletconnect/react-native-dapp"
import { useSetRecoilState } from "recoil"
import { Screen } from "../../components"
import { AssetService } from "../../services"
import AssetList, { AssetListHandle } from "../../components/asset-list"
import { useFloatHederAnimation } from "../../utils/hooks"
import { palette } from "../../theme/palette"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { Assets } from "../../services/localdb"
import {
  Header,
  HeaderLogo,
  HeaderLeftContainer,
  HeaderRightContainer,
} from "../../components/header"
import { ThemeContext } from "../../theme"
import { AppNavigationNames } from "../../navigators"
import { uploadAssetsInBackground } from "../../services/sync-service"
import { SharedElement } from "react-navigation-shared-element"
import * as helper from "../../utils/helper"
import { Asset, RecyclerAssetListSection, ViewType } from "../../types"
import { singleAssetState } from "../../store"
interface Props {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
  medias: Asset[]
  defaultHeader?: (style: any) => JSX.Element | undefined
  loading: boolean
}

export const AssetListScreen: React.FC<Props> = ({
  navigation,
  medias,
  defaultHeader,
  loading,
}) => {
  const [recyclerSections, setRecyclerSections] = useState<RecyclerAssetListSection[]>(null)
  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<stringp[]>([])
  const assetListRef = useRef<AssetListHandle>()
  const { toggleTheme } = useContext(ThemeContext)
  const { theme } = useTheme()
  const walletConnector = useWalletConnect()
  const setSingleAsset = useSetRecoilState(singleAssetState)
  useEffect(() => {
    if (medias) {
      setRecyclerSections([...AssetService.categorizeAssets([...medias])])
    }
  }, [medias])

  const cancelSelectionMode = () => {
    assetListRef?.current?.toggleSelectionMode()
  }

  const deleteAssets = () => {
    Alert.alert("Delete", "Are you sure want to delete these assets?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const deleted = await AssetService.deleteAssets(selectedItems)
            if (deleted) {
              assetListRef?.current?.resetSelectedItems()
              await Assets.addOrUpdate(
                selectedItems.map((id) => ({
                  id,
                  isDeleted: true,
                })),
              )
              cancelSelectionMode()
            }
          } catch (error) {
            console.log("deleteAssets: ", error)
          }
        },
      },
    ])
  }
  const batchUpload = () => {
    Alert.alert("Upload", "Are you sure want to upload these assets?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await Assets.markAsSYNC(selectedItems)
            cancelSelectionMode()
            Toast.show({
              type: "success",
              text1: "Marked to sync as soon as possible",
              position: "bottom",
              bottomOffset: 0,
            })
            uploadAssetsInBackground()
          } catch (error) {
            console.log(error)
          }
        },
      },
    ])
  }
  const onAssetLoadError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (error?.nativeEvent?.error) {
      // Error is something like "/storage/emulated/0/DCIM/Camera/20220501_200313.jpg: open failed: ENOENT (No such file or directory)"
      const errorParts = (error.nativeEvent.error as string)?.split(":")
      if (errorParts?.[1]?.includes("open failed")) {
        console.log("onAssetLoadError:", errorParts?.[0])
        Assets.removeByUri(errorParts?.[0].trim())
      }
    }
  }

  const onItemPress = (section: RecyclerAssetListSection) => {
    if (section.type === ViewType.ASSET) {
      const asset: Asset = section.data
      setSingleAsset(JSON.parse(JSON.stringify(asset)))
      navigation.push(AppNavigationNames.PhotoScreen, { assetId: asset.id })
    }
  }

  const onSelectedItemsChange = (assetIds: string[], selectionMode: boolean) => {
    setSelectionMode(selectionMode)
    setSelectedItems(assetIds)
  }

  const renderHeader = () => {
    if (selectionMode) {
      return (
        <Header
          style={headerStyles}
          leftComponent={
            <HeaderLeftContainer>
              <Icon type="material-community" name="close" onPress={cancelSelectionMode} />
              <Text style={{ fontSize: 16, marginStart: 20 }}>{selectedItems?.length}</Text>
            </HeaderLeftContainer>
          }
          rightComponent={
            <HeaderRightContainer>
              <Icon
                style={styles.headerIcon}
                type="material-community"
                name="upload-multiple"
                onPress={batchUpload}
              />
              <Icon
                style={styles.headerIcon}
                type="material-community"
                name="delete"
                onPress={() => deleteAssets("delete")}
              />
            </HeaderRightContainer>
          }
        />
      )
    } else {
      return (
        defaultHeader?.(headerStyles) || (
          <Header
            style={headerStyles}
            centerComponent={<HeaderLogo />}
            leftComponent={
              <HeaderLeftContainer>
                <Icon
                  type="material-community"
                  name="white-balance-sunny"
                  onPress={() => {
                    toggleTheme()
                  }}
                />
              </HeaderLeftContainer>
            }
            rightComponent={
              <HeaderRightContainer>
                <SharedElement id="AccountAvatar">
                  {walletConnector.connected ? (
                    <Avatar
                      containerStyle={styles.avatar}
                      ImageComponent={() => (
                        <Image
                          source={
                            walletConnector.peerMeta?.icons?.[0].endsWith(".svg")
                              ? helper.getWalletImage(walletConnector.peerMeta?.name)
                              : { uri: walletConnector.peerMeta?.icons?.[0] }
                          }
                          style={{
                            height: 35,
                            width: 35,
                          }}
                          resizeMode="contain"
                        />
                      )}
                      onPress={() => navigation.navigate(AppNavigationNames.AccountScrenn)}
                    />
                  ) : (
                    <Avatar
                      containerStyle={styles.disconnectedAvatar}
                      icon={{ name: "account-alert", type: "material-community", size: 34 }}
                      size="small"
                      rounded={true}
                      onPress={() => navigation.navigate(AppNavigationNames.AccountScrenn)}
                    />
                  )}
                </SharedElement>
              </HeaderRightContainer>
            }
          />
        )
      )
    }
  }
  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )
    }
    return null
  }
  return (
    <Screen scrollEventThrottle={16} automaticallyAdjustContentInsets style={styles.screen}>
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
          renderFooter={renderFooter}
          onItemPress={onItemPress}
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
  footerContainer: {
    padding: 5,
  },
  headerIcon: {
    marginStart: 10,
  },
  avatar: {
    backgroundColor: "gray",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  disconnectedAvatar: {
    backgroundColor: "gray",
    marginHorizontal: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
  },
})
