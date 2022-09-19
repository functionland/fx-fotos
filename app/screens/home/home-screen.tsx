import React, { useEffect, useRef, useState, useContext } from 'react'
import { Alert } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import { useRecoilState } from 'recoil'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AssetService } from '../../services'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import { mediasState } from '../../store'
import { Assets } from '../../services/localdb'
import { Entities } from '../../realmdb'
import { AssetListScreen } from '../index'

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
  const [loading, setLoading] = useState(true)
  const requestAndroidPermission = async () => {
    try {
      console.log('requestAndroidPermission')
      await MediaLibrary.requestPermissionsAsync(true)
    } catch (err) {
      Alert.alert('Request permission', JSON.stringify(err))
      console.warn(err)
    } finally {
      setIsReady(true)
    }
  }

  useEffect(() => {
    requestAndroidPermission()
  }, [])

  useEffect(() => {
    if (isReady) {
      ;(async () => {
        realmAssets.current = await Assets.getAll()
        realmAssets.current.addListener(onLocalDbAssetChange)
        const assets = []
        for (const asset of realmAssets.current) {
          assets.push(asset)
        }
        setMedias(assets)
        syncAssets(
          assets?.[0]?.modificationTime,
          assets?.[assets.length - 1]?.modificationTime,
        )
        // remove listener after screen disposed
        return () => {
          realmAssets.current?.removeAllListeners()
        }
      })()
    }
  }, [isReady])

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
      let allMedias: MediaLibrary.PagedInfo<MediaLibrary.Asset> = null
      let lastAsset: MediaLibrary.Asset = null
      let fitstAsset: MediaLibrary.Asset = null
      do {
        allMedias = await AssetService.getAssets(first, allMedias?.endCursor)
        await Assets.addOrUpdate(allMedias.assets)
        if (first === 20) {
          // Get the first assets that is created
          fitstAsset = (
            await AssetService.getAssets(1, null, [['modificationTime', true]])
          )?.assets?.[0]
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

  return (
    <AssetListScreen
      navigation={navigation}
      medias={isReady ? medias : null}
      loading={loading}
      showStoryHighlight
    />
  )
}
