import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react'
import {
  Alert,
  Platform,
  RefreshControl,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { request, PERMISSIONS, openSettings } from 'react-native-permissions'
import { fula } from '@functionland/react-native-fula'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AssetService, SyncService } from '../../services'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import Realm from 'realm'
import {
  dIDCredentialsState,
  foldersSettingsState,
  fulaPeerIdState,
  mediasState,
} from '../../store'
import { Assets, Boxs, FolderSettings } from '../../services/localdb'
import { Entities } from '../../realmdb'
import { AssetListScreen } from '../index'
import { Asset, PagedInfo } from '../../types'
import { Header, Screen } from '../../components'
import {
  HeaderLeftContainer,
  HeaderLogo,
  HeaderRightContainer,
} from '../../components/header'
import * as KeyChain from '../../utils/keychain'

import { Avatar, Icon, Image, LinearProgress } from '@rneui/themed'
import { SharedElement } from 'react-navigation-shared-element'
import { AppNavigationNames } from '../../navigators'
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import { ThemeContext } from '../../theme'
import * as helper from '../../utils/helper'
import Animated from 'react-native-reanimated'
import deviceUtils from '../../utils/deviceUtils'
import { FolderSettingsEntity } from '../../realmdb/entities'

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<
    HomeNavigationParamList,
    HomeNavigationTypes
  >
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isReady, setIsReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const walletConnector = useWalletConnect()
  const [dIDCredentials, setDIDCredentialsState] =
    useRecoilState(dIDCredentialsState)

  const [, setFulaPeerId] = useRecoilState(fulaPeerIdState)
  const setFoldersSettings = useSetRecoilState(foldersSettingsState)

  const { toggleTheme } = useContext(ThemeContext)

  const realmAssets =
    useRef<Realm.Results<Entities.AssetEntity & Realm.Object>>(null)
  const [medias, setMedias] = useRecoilState(mediasState)
  const [loading, setLoading] = useState(false)
  const [mediasRefObj, setMediasRefObj] = useState<Record<string, Asset>>({})

  const requestAndroidPermission = useCallback(async () => {
    try {
      const permissions = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      })
      const result = await request(permissions)
      if (result === 'granted') {
        setIsReady(true)
      } else {
        Alert.alert(
          'Need Permission!',
          'Please allow to access photos and media on your phone',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Ok',
              onPress: () => openSettings(),
            },
          ],
        )
      }
    } catch (err) {
      Alert.alert('Request permission', JSON.stringify(err))
      console.warn(err)
    }
  }, [])

  useEffect(() => {
    loadFoldersSettings()
    initDID()
  }, [])

  useEffect(() => {
    if (dIDCredentials?.username && dIDCredentials?.password) {
      initFula(dIDCredentials.username, dIDCredentials.password)
    }
  }, [dIDCredentials])

  useEffect(() => {
    requestAndroidPermission()
    return () => {
      realmAssets.current?.removeAllListeners()
    }
  }, [])

  useEffect(() => {
    if (isReady) {
      loadAssets(true)
    }
  }, [isReady])

  const loadFoldersSettings = async () => {
    try {
      const folders = await FolderSettings.getAll()
      const foldersObj = folders.reduce((obj, folder) => {
        obj[folder?.name] = folder
        return obj
      }, {} as Record<string, FolderSettingsEntity>)
      setFoldersSettings(foldersObj)
    } catch (error) {
      console.log(error)
    }
  }

  const initDID = async () => {
    const didCredentialsObj = await KeyChain.load(
      KeyChain.Service.DIDCredentials,
    )
    if (didCredentialsObj) {
      const fulaPeerIdObject = await KeyChain.load(
        KeyChain.Service.FULAPeerIdObject,
      )
      if (fulaPeerIdObject) {
        setFulaPeerId(fulaPeerIdObject)
      }
      setDIDCredentialsState(didCredentialsObj)
    }
  }
  const initFula = async (password: string, signiture: string) => {
    try {
      if (await fula.isReady()) return

      const box = (await Boxs.getAll())?.[0]
      if (box) {
        const fulaInit = await SyncService.initFula()

        if (fulaInit) {
          await helper.storeFulaRootCID(fulaInit.rootCid)
          const fulaPeerId = await helper.storeFulaPeerId(fulaInit.peerId)
          if (fulaPeerId) setFulaPeerId(fulaPeerId)
          await fula.checkFailedActions(true)
        }
      }
    } catch (error) {
      console.log('fulaInit Error', error)
    }
  }
  const loadAssets = async (syncMetadata: boolean = true) => {
    try {
      realmAssets.current?.removeAllListeners()
      realmAssets.current = await Assets.getAll()
      realmAssets.current.addListener(onLocalDbAssetChange)
      const obj = {}
      const assetSlice = realmAssets.current?.slice()
      assetSlice?.forEach(asset => (obj[asset.id] = asset))
      setMedias(assetSlice)
      setMediasRefObj(obj)
      if (syncMetadata) {
        await syncAssets(
          realmAssets.current?.[0]?.modificationTime,
          realmAssets.current?.[realmAssets.current.length - 1]
            ?.modificationTime,
        )
        syncAssetsMetadata()
        await SyncService.setAutoBackupAssets()
        SyncService.uploadAssetsInBackground()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onRefresh = async () => {
    try {
      setRefreshing(true)
      await loadAssets(true)
    } catch (error) {
      console.log(error)
    }
    setRefreshing(false)
  }

  const onLocalDbAssetChange = (
    collection: Realm.Collection<Entities.AssetEntity>,
    changes: Realm.CollectionChangeSet,
  ) => {
    if (changes.insertions?.length) {
      changes.insertions.forEach(index => {
        mediasRefObj[collection[index].id] = collection[index]
      })

      setMediasRefObj(prev => {
        const next = {
          ...prev,
          ...mediasRefObj,
        }
        setMedias(Object.values(next))
        return next
      })

      //loadAssets(false)
    } else if (changes.newModifications?.length) {
      changes.newModifications.forEach(index => {
        mediasRefObj[collection[index].id] = collection[index]
      })
      setMediasRefObj(prev => {
        const next = {
          ...prev,
          ...mediasRefObj,
        }
        return next
      })
    } else if (changes.deletions?.length) {
      changes.deletions.forEach(index => {
        delete mediasRefObj[collection[index].id]
      })

      setMediasRefObj(prev => {
        const next = {
          ...prev,
          ...mediasRefObj,
        }
        setMedias(Object.values(next))
        return next
      })
    }
  }

  const syncAssets = async (
    lastAssetTime = 0,
    firstAssetTime = new Date().getTime(),
  ) => {
    try {
      let first = 20
      let allMedias: PagedInfo<Asset> = null
      let lastAsset: Asset = null
      let fitstAsset: Asset = null
      do {
        allMedias = await AssetService.getAssets({
          first,
          after: allMedias?.endCursor,
        })
        await Assets.addOrUpdate(
          allMedias.assets.map(asset => ({
            id: asset.id,
            uri: asset.uri,
            height: asset.height,
            width: asset.width,
            creationTime: asset.creationTime,
            modificationTime: asset.modificationTime,
            albumId: asset.albumId,
            mediaType: asset.mediaType,
            mimeType: asset.mimeType,
          })),
        )
        if (first === 20) {
          // Get the first assets that is created
          fitstAsset = allMedias.assets?.[0]
        }
        first *= 4
        lastAsset = allMedias.assets?.[allMedias.assets.length - 1]

        // Repeat the loop if the first asset's date in the storage is less than the first asset's date in the local DB
      } while (
        allMedias.hasNextPage &&
        (lastAsset?.modificationTime > lastAssetTime ||
          fitstAsset?.modificationTime < firstAssetTime)
      )
    } catch (error) {
      console.error('syncAssets:', error)
    } finally {
      setLoading(false)
    }
  }
  const syncAssetsMetadata = async () => {
    try {
      const localAssets = await Assets.getAll({ descriptor: 'creationTime' })

      let allMedias: PagedInfo<Asset> = null
      let startTime = null
      const syncBundariesObj = localAssets.reduce((obj, asset) => {
        if (asset.metadataIsSynced && startTime != null) {
          obj[startTime] = asset.creationTime
          startTime = null
        } else if (!asset.metadataIsSynced && startTime === null) {
          startTime = asset.creationTime
          obj[startTime] = startTime
        } else if (!asset.metadataIsSynced && startTime != null) {
          obj[startTime] = asset.creationTime
        }
        return obj
      }, {})

      const syncBundaries = Object.keys(syncBundariesObj)
      if (
        !syncBundaries.some(
          startDate => syncBundariesObj[startDate] != startDate,
        )
      ) {
        return
      }

      setSyncing(true)
      const assetsMetadatas = []
      for (let index = 0; index < syncBundaries.length; index++) {
        const toTime = Number.parseInt(syncBundaries[index])
        const fromTime = Number.parseInt(syncBundariesObj[syncBundaries[index]])
        let first = 100
        do {
          allMedias = await AssetService.getAssets({
            first,
            after: allMedias?.endCursor,
            fromTime,
            toTime,
            include: [
              'filename',
              'fileSize',
              //'location', //For now we don't need location
              'imageSize',
              'playableDuration',
            ],
          })
          allMedias?.assets.map<Asset>(asset =>
            assetsMetadatas.push({
              id: asset.id,
              filename: asset.filename,
              filenameNormalized: asset.filenameNormalized,
              duration: asset?.duration,
              //location: asset?.location,
              fileSize: asset?.fileSize,
              metadataIsSynced: true,
            }),
          )
        } while (allMedias.hasNextPage)
        await Assets.addOrUpdate(assetsMetadatas)
      }
    } catch (error) {
      console.log('syncAssetsMetadata:', error)
    } finally {
      setSyncing(false)
    }
  }
  const renderHeader = (headerStyles: ViewStyle) => {
    return (
      <Animated.View
        style={[
          { position: 'absolute', top: 0, zIndex: 99, width: '100%' },
          headerStyles,
        ]}
      >
        <Header
          containerStyle={{ position: 'relative' }}
          centerComponent={<HeaderLogo />}
          leftContainerStyle={{ zIndex: 99 }}
          leftComponent={
            <HeaderLeftContainer style={{ flex: 1 }}>
              <Icon
                type="material-community"
                name="white-balance-sunny"
                size={28}
                onPress={() => {
                  toggleTheme()
                }}
              />
            </HeaderLeftContainer>
          }
          rightComponent={
            Platform.OS === 'android' || Platform.OS === 'ios' ? (
              <HeaderRightContainer style={{ flex: 1 }}>
                <SharedElement id="AccountAvatar">
                  {walletConnector.connected ? (
                    <Avatar
                      containerStyle={styles.avatar}
                      ImageComponent={() => (
                        <Image
                          source={
                            walletConnector.peerMeta?.icons?.[0].endsWith(
                              '.svg',
                            )
                              ? helper.getWalletImage(
                                  walletConnector.peerMeta?.name,
                                )
                              : {
                                  uri: walletConnector.peerMeta?.icons?.[0],
                                }
                          }
                          style={{
                            height: 35,
                            width: 35,
                          }}
                          resizeMode="contain"
                        />
                      )}
                      onPress={() =>
                        navigation.navigate(AppNavigationNames.AccountScreen)
                      }
                    />
                  ) : (
                    <Avatar
                      containerStyle={styles.disconnectedAvatar}
                      icon={{
                        name: 'account-alert',
                        type: 'material-community',
                        size: 34,
                      }}
                      size="small"
                      rounded
                      onPress={() =>
                        navigation.navigate(AppNavigationNames.AccountScreen)
                      }
                    />
                  )}
                </SharedElement>
              </HeaderRightContainer>
            ) : null
          }
        />
        {syncing && <LinearProgress />}
      </Animated.View>
    )
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <AssetListScreen
        navigation={navigation}
        medias={isReady ? medias : null}
        externalState={mediasRefObj}
        loading={loading}
        showStoryHighlight
        defaultHeader={renderHeader}
        refreshControl={
          <RefreshControl
            progressViewOffset={60}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
