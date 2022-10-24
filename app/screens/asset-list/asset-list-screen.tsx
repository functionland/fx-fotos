import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  Alert,
  View,
  ActivityIndicator,
  ImageErrorEventData,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native'
import LottieView from 'lottie-react-native'
import { Icon, Text, useTheme } from '@rneui/themed'
import Toast from 'react-native-toast-message'
import { useSetRecoilState } from 'recoil'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { AssetService } from '../../services'
import AssetList, { AssetListHandle } from '../../components/asset-list'
import { useFloatHederAnimation } from '../../utils/hooks'
import { palette } from '../../theme/palette'
import { Assets } from '../../services/localdb'
import {
  Header,
  HeaderLeftContainer,
  HeaderRightContainer,
} from '../../components/header'
import { AppNavigationNames, RootStackParamList } from '../../navigators'
import { uploadAssetsInBackground } from '../../services/sync-service'
import {
  Asset,
  AssetStory,
  RecyclerAssetListSection,
  ViewType,
} from '../../types'
import {
  recyclerSectionsState,
  singleAssetState,
  selectedStoryState,
} from '../../store'
import { SharedValue } from 'react-native-reanimated'

interface Props {
  medias: Asset[]
  defaultHeader?: (style: ViewStyle) => JSX.Element | undefined
  loading: boolean
  showStoryHighlight: boolean
  externalScrollY?: SharedValue<number>
  contentContainerStyle?: ViewStyle
}

export const AssetListScreen: React.FC<Props> = ({
  medias,
  defaultHeader,
  loading,
  showStoryHighlight,
  externalScrollY,
  contentContainerStyle,
}) => {
  const setRecyclerSectionsStore = useSetRecoilState(recyclerSectionsState)
  const [recyclerSections, setRecyclerSections] = useState(null)

  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const assetListRef = useRef<AssetListHandle>()
  const { theme } = useTheme()
  const setSingleAsset = useSetRecoilState(singleAssetState)
  const setSelectedStoryState = useSetRecoilState(selectedStoryState)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    if (medias) {
      const sections = [
        ...AssetService.categorizeAssets([...medias], showStoryHighlight),
      ]
      setRecyclerSections(sections)
    }
  }, [medias])

  const cancelSelectionMode = () => {
    assetListRef?.current?.toggleSelectionMode()
  }

  const deleteAssets = () => {
    Alert.alert('Delete', 'Are you sure want to delete these assets?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await AssetService.deleteAssets(selectedItems)
            assetListRef?.current?.resetSelectedItems()
            await Assets.addOrUpdate(
              selectedItems.map(id => ({
                id,
                isDeleted: true,
              })),
            )
            cancelSelectionMode()
          } catch (error) {
            console.log('deleteAssets: ', error)
          }
        },
      },
    ])
  }
  const batchUpload = () => {
    Alert.alert('Upload', 'Are you sure want to upload these assets?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await Assets.markAsSYNC(selectedItems)
            cancelSelectionMode()
            Toast.show({
              type: 'success',
              text1: 'Marked to sync as soon as possible',
              position: 'bottom',
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
  const onAssetLoadError = (
    error: NativeSyntheticEvent<ImageErrorEventData>,
  ) => {
    if (error?.nativeEvent?.error) {
      // Error is something like "/storage/emulated/0/DCIM/Camera/20220501_200313.jpg: open failed: ENOENT (No such file or directory)"
      const errorParts = (error.nativeEvent.error as string)?.split(':')
      if (errorParts?.[1]?.includes('open failed')) {
        console.log('onAssetLoadError:', errorParts?.[0])
        Assets.removeByUri(errorParts?.[0].trim())
      }
    }
  }

  const onItemPress = useCallback(
    (section: RecyclerAssetListSection) => {
      if (section.type === ViewType.ASSET) {
        const asset: Asset = section.data
        setSingleAsset(JSON.parse(JSON.stringify(asset)))
        setRecyclerSectionsStore(recyclerSections)
        navigation.navigate(AppNavigationNames.ImageGalleryViewer, {
          assetId: asset.id,
          scrollToItem: assetListRef.current.scrollToItem,
        })
      }
    },
    [recyclerSections],
  )
  const onStoryPress = useCallback(
    (story: AssetStory) => {
      setSelectedStoryState(story)
      setRecyclerSectionsStore(recyclerSections)
      navigation.navigate(AppNavigationNames.HighlightScreen, {
        storyId: story.id,
      })
    },
    [recyclerSections],
  )
  const onSelectedItemsChange = (
    assetIds: string[],
    selectionMode: boolean,
  ) => {
    setSelectionMode(selectionMode)
    setSelectedItems(assetIds)
  }

  React.useEffect(() => {
    setSelectionMode(() => selectedItems.length !== 0)
  }, [selectedItems])

  const renderHeader = () => {
    if (selectionMode) {
      return (
        <Header
          style={headerStyles}
          leftComponent={
            <HeaderLeftContainer>
              <Icon
                type="material-community"
                name="close"
                onPress={cancelSelectionMode}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginStart: 20,
                }}
              >
                {selectedItems?.length}
              </Text>
            </HeaderLeftContainer>
          }
          rightComponent={
            <HeaderRightContainer>
              {/* <Icon
                style={styles.headerIcon}
                type="material-community"
                name="upload-multiple"
                onPress={batchUpload}
              /> */}
              <Icon
                style={styles.headerIcon}
                type="material-community"
                name="delete"
                onPress={() => deleteAssets('delete')}
              />
            </HeaderRightContainer>
          }
        />
      )
    }
    return defaultHeader?.(headerStyles)
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
    <>
      {renderHeader()}
      {!recyclerSections ? (
        <View style={styles.loaderContainer}>
          <LottieView
            autoPlay
            loop
            source={require('../../../assets/lotties/photo-loading.json')}
          />
          <Text style={styles.loadingText}>Gathering photos</Text>
        </View>
      ) : !recyclerSections?.length ? (
        <Text style={styles.emptyText}>Gallery is empty!</Text>
      ) : (
        <AssetList
          ref={assetListRef}
          sections={recyclerSections}
          scrollY={externalScrollY || scrollY}
          onSelectedItemsChange={onSelectedItemsChange}
          onAssetLoadError={onAssetLoadError}
          renderFooter={renderFooter}
          onItemPress={onItemPress}
          onStoryPress={onStoryPress}
          contentContainerStyle={contentContainerStyle}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: '800',
  },
  loadingText: {
    alignSelf: 'center',
    color: palette.lightGrey,
    fontSize: 16,
    marginTop: 250,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  footerContainer: {
    padding: 5,
  },
  headerIcon: {
    marginStart: 10,
  },
  avatar: {
    backgroundColor: 'gray',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  disconnectedAvatar: {
    backgroundColor: 'gray',
    marginHorizontal: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
  },
})
