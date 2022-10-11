import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, Platform, StyleSheet } from 'react-native'
import { useRecoilState } from 'recoil'
import { request, PERMISSIONS, openSettings } from 'react-native-permissions'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AssetService } from '../../services'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import Realm from 'realm'
import { mediasState } from '../../store'
import { Assets } from '../../services/localdb'
import { Entities } from '../../realmdb'
import { AssetListScreen } from '../index'
import { Asset, PagedInfo } from '../../types'
import { Screen } from '../../components'

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<
    HomeNavigationParamList,
    HomeNavigationTypes
  >
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isReady, setIsReady] = useState(false)
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

  const loadAssets = async () => {
    try {
      realmAssets.current?.removeAllListeners()
      realmAssets.current = await Assets.getAll()
      realmAssets.current.addListener(onLocalDbAssetChange)
      const assets = []
      for (const asset of realmAssets.current) {
        assets.push(asset)
      }
      setMedias(assets)
      await syncAssets(
        assets?.[0]?.modificationTime,
        assets?.[assets.length - 1]?.modificationTime,
      )
      syncAssetsMetadata(realmAssets.current)
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
        await Assets.addOrUpdate(allMedias.assets)
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
              'location',
              'imageSize',
              'playableDuration',
            ],
          })

          await Assets.addOrUpdate(
            allMedias?.assets.map<Asset>(asset => ({
              id: asset.id,
              filename: asset.filename,
              filenameNormalized: asset.filenameNormalized,
              duration: asset.duration,
              location: asset.location,
              fileSize: asset.fileSize,
              metadataIsSynced: true,
            })),
          )
          first *= 2
        } while (allMedias.hasNextPage)
      }
    } catch (error) {
      console.log('syncAssetsMetadata:', error)
    }
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
      />
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
})
