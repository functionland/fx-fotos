import React, { useEffect, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { useRecoilState } from 'recoil'
import { request, PERMISSIONS } from 'react-native-permissions'

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
import { useCallback } from 'react'

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
      console.log('requestAndroidPermission')
      const permissions = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      })

      const result = await request(permissions, {
        title: 'Permission',
        message: 'Please grant acces to the media library on your phone!',
        buttonPositive: 'Yes',
      })
      if (result === 'granted') {
        setIsReady(true)
      } else if (result === 'blocked') {
        Alert.alert(
          'Permission',
          'Please grant access to the media library on your phone!',
        )
      }
    } catch (err) {
      Alert.alert('Request permission', JSON.stringify(err))
      console.warn(err)
    }
  }, [])

  useEffect(() => {
    requestAndroidPermission()
  }, [])

  useEffect(() => {
    if (isReady) {
      ; (async () => {
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
      let allMedias: PagedInfo<Asset> = null
      let lastAsset: Asset = null
      let fitstAsset: Asset = null
      do {
        allMedias = await AssetService.getAssets(first, allMedias?.endCursor)
        await Assets.addOrUpdate(allMedias.assets)
        if (first === 20) {
          // Get the first assets that is created
          fitstAsset = (await AssetService.getAssets(1, null))?.assets?.[0]
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
