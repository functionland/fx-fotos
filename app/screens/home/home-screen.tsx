import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react'
import { Alert, Platform, StyleSheet, View, ViewStyle } from 'react-native'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { request, PERMISSIONS, openSettings } from 'react-native-permissions'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AssetService } from '../../services'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import Realm from 'realm'
import { dIDCredentials, mediasState } from '../../store'
import { Assets } from '../../services/localdb'
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

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<
    HomeNavigationParamList,
    HomeNavigationTypes
  >
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isReady, setIsReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const walletConnector = useWalletConnect()
  const setDIDCredentialsState = useSetRecoilState(dIDCredentials)

  const { toggleTheme } = useContext(ThemeContext)

  const realmAssets =
    useRef<Realm.Results<Entities.AssetEntity & Realm.Object>>(null)
  const [medias, setMedias] = useRecoilState(mediasState)
  const [loading, setLoading] = useState(false)

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
    initDID()
  }, [])

  useEffect(() => {
    requestAndroidPermission()
    return () => {
      realmAssets.current?.removeAllListeners()
    }
  }, [])

  useEffect(() => {
    if (isReady) {
      loadAssets()
    }
  }, [isReady])

  const initDID = async () => {
    const didCredentials = await KeyChain.load(KeyChain.Service.DIDCredentials)
    if (didCredentials) {
      setDIDCredentialsState(didCredentials)
    }
  }

  const loadAssets = async () => {
    try {
      realmAssets.current?.removeAllListeners()
      realmAssets.current = await Assets.getAll()
      realmAssets.current.addListener(onLocalDbAssetChange)
      setMedias(realmAssets.current.slice(0, realmAssets.current.length - 1))
      await syncAssets(
        realmAssets.current?.[0]?.modificationTime,
        realmAssets.current?.[realmAssets.current.length - 1]?.modificationTime,
      )
      syncAssetsMetadata()
    } catch (error) {
      console.error(error)
    }
  }

  const onLocalDbAssetChange = (
    collection: Realm.Collection<Entities.AssetEntity>,
    changes: Realm.CollectionChangeSet,
  ) => {
    setMedias(prev => {
      let assets = [...prev]
      if (changes.deletions?.length) {
        assets = assets.filter(
          (_, index) => !changes.deletions.some(i => i === index),
        )
        return [...assets]
      }
      if (changes.insertions?.length) {
        changes.insertions.map(index => {
          assets.push(collection[index])
        })
        return assets
      }
      if (changes.newModifications?.length) {
        assets = []
        for (const asset of collection) {
          assets.push(asset)
        }
        return assets
      }
      return prev
    })
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
            Platform.OS === 'android' ? (
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
        loading={loading}
        showStoryHighlight
        defaultHeader={renderHeader}
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
