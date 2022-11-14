import { NavigationProp, RouteProp } from '@react-navigation/native'
import { BottomSheet, Button, Card, Icon, Input, Text } from '@rneui/themed'
import {
  DataProvider,
  GridLayoutProvider,
  RecyclerListView,
} from 'fula-recyclerlistview'
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Share,
  TouchableOpacity,
  useWindowDimensions,
  View,
  InteractionManager,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { NativeViewGestureHandler } from 'react-native-gesture-handler'
import { useRecoilState } from 'recoil'
import Toast from 'react-native-toast-message'
import { useNetInfo } from '@react-native-community/netinfo'
import { TaggedEncryption } from '@functionland/fula-sec'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Header, Screen } from '../../components'
import {
  HeaderArrowBack,
  HeaderLeftContainer,
  HeaderRightContainer,
} from '../../components/header'
import { RootStackParamList } from '../../navigators/app-navigator'
import { Assets } from '../../services/localdb'
import { singleAssetState, recyclerSectionsState } from '../../store'
import {
  Asset,
  RecyclerAssetListSection,
  SyncStatus,
  VideoPlayerMetadata,
  VideoPlayerProgress,
  ViewType,
} from '../../types'
import { GalleryImage } from './gallery-image'
import * as helper from '../../utils/helper'
import { palette } from '../../theme'
import { AssetService } from '../../services'
import LinearGradient from 'react-native-linear-gradient'

interface ImageGalleryViewerScreenProps {
  navigation: NavigationProp<RootStackParamList>
  route: RouteProp<RootStackParamList, 'ImageGalleryViewer'>
}
interface ExtendedState {
  currentVideoMuted: boolean
  currentVideoPaused: boolean
  currentAssetId: string
}

export const ImageGalleryViewerScreen: React.FC<
  ImageGalleryViewerScreenProps
> = ({ route, navigation }) => {
  const [asset, setAsset] = useRecoilState(singleAssetState)
  const [recyclerList, setRecyclerList] = useRecoilState(recyclerSectionsState)
  const { assetId, scrollToItem } = route.params
  const windowDims = useWindowDimensions()
  const initialIndexRef = useRef(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showShareBottomSheet, setShowShareBottomSheet] = useState(false)
  const [DID, setDID] = useState('')
  const [sharing, setSharing] = useState(false)
  const netInfoState = useNetInfo()
  const screenOpacity = useSharedValue(1)
  const currentAssetRef = useRef(asset)
  const [transitionDone, setTransitionDone] = useState(false)
  const optionsVisibleRef = useRef(false)
  const headerOpacity = useSharedValue(0)

  const [extendedState, setExtendedState] = useState<ExtendedState>({
    currentVideoMuted: true,
    currentVideoPaused: false,
    currentAssetId: assetId,
  })
  const headerHeightRef = useRef(0)
  const footerHeightRef = useRef(0)
  const [assetSections, setAssetSections] = useState<RecyclerAssetListSection>(
    recyclerList.filter(section => section.type === ViewType.ASSET),
  )
  useEffect(() => {
    setAssetSections(
      recyclerList.filter(section => section.type === ViewType.ASSET),
    )
  }, [recyclerList])

  if (initialIndexRef.current === null) {
    assetSections.forEach((section, idx) => {
      if (section.data.id === assetId) {
        initialIndexRef.current = idx
      }
    })
  }
  const listGestureRef = useRef()
  const rclRef = useRef()

  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() =>
      setTimeout(() => {
        setTransitionDone(true)
        rclRef.current?.forceRerender()
      }, 0),
    )

    return () => {
      interactionPromise.cancel()
    }
  }, [])

  const enableScroll = useCallback(() => {
    setScrollEnabled(true)
  }, [])

  const disableScroll = useCallback(() => {
    setScrollEnabled(false)
  }, [])

  const toggleMenu = useCallback(forceValue => {
    if (forceValue != null) {
      optionsVisibleRef.current = forceValue
    } else {
      optionsVisibleRef.current = !optionsVisibleRef.current
    }
    headerOpacity.value = withTiming(optionsVisibleRef.current ? 1 : 0, {
      duration: 200,
    })
  }, [])

  const rowRenderer = useCallback(
    (type: string | number, data: Asset, index, extState: ExtendedState) => {
      // if (!data) return null
      // if (data?.syncStatus === SyncStatus.SYNCED && data?.isDeleted) {
      //   return renderDownloadSection()
      // }
      // if (data.isDeleted) {
      //   return null
      // }
      return (
        <GalleryImage
          asset={data}
          toggleMenu={toggleMenu}
          sharedElementId={transitionDone ? data.id : `${data.id}_`}
          enableParentScroll={enableScroll}
          disableParentScroll={disableScroll}
          listGestureRef={listGestureRef}
          screenOpacity={screenOpacity}
          isCurrentView={extState?.currentAssetId === data.id}
          videoPaused={extState?.currentVideoPaused}
          videoMuted={extState?.currentVideoMuted}
        />
      )
    },
    [transitionDone, enableScroll, disableScroll, toggleMenu, screenOpacity],
  )

  const layoutProvider = useMemo(
    () =>
      new GridLayoutProvider(
        1,
        () => 'PHOTO',
        () => 1,
        () => windowDims.width,
      ),
    [windowDims],
  )

  const dataProvider = useMemo(() => {
    let provider = new DataProvider((r1: Asset, r2: Asset) => r1?.id !== r2?.id)
    provider = provider.cloneWithRows(
      assetSections.map(section => section.data),
      0,
    )
    return provider
  }, [assetSections])

  const goBack = useCallback(() => {
    navigation.setParams({
      assetId: currentAssetRef.current.id,
    })
    setTimeout(() => {
      navigation.goBack()
    })
  }, [])

  const deleteAsset = () => {
    Alert.alert('Delete', 'Are you sure want to delete these assets?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const currentIndex = assetSections.findIndex(
              section => section?.data?.id == currentAssetRef.current?.id,
            )
            const nextAssetIndex =
              currentIndex === assetSections.length - 1
                ? currentIndex - 1 //Go to the next asset
                : currentIndex // Go to the previouse asset
            rclRef.current.scrollToIndex(nextAssetIndex, true)
            currentAssetRef.current = assetSections[nextAssetIndex]?.data
            await AssetService.deleteAssets([assetSections[currentIndex]?.id])
            await Assets.addOrUpdate([
              {
                id: assetSections[currentIndex]?.id,
                isDeleted: true,
              },
            ])
            setRecyclerList(
              recyclerList.filter(
                section => section?.data?.id != assetSections[currentIndex]?.id,
              ),
            )
            return
          } catch (error) {
            console.log('deleteAssets: ', error)
          }
        },
      },
    ])
  }
  const cancelUpdate = useCallback(() => {
    Alert.alert('Waiting for connection', 'Will upload when connected', [
      {
        text: 'Cancel update',
        onPress: async () => {
          console.log('onPressed ', asset)
          await Assets.addOrUpdate([
            {
              id: asset.id,
              syncStatus: SyncStatus.NOTSYNCED,
            },
          ])
          setAsset(prev => ({
            ...prev,
            syncStatus: SyncStatus.NOTSYNCED,
          }))
        },
      },
      {
        text: 'OK',
      },
    ])
  }, [asset])

  const uploadToBox = async () => {
    if (asset?.syncStatus === SyncStatus.NOTSYNCED && !asset?.isDeleted) {
      setLoading(true)
      setTimeout(async () => {
        try {
          // const _filePath = asset.uri?.split('file:')[1];
          // const result = await file.send(decodeURI(_filePath))
          // console.log("result:",result)
          await Assets.addOrUpdate([
            {
              id: asset.id,
              syncStatus: SyncStatus.SYNC,
            },
          ])
          setAsset(prev => ({
            ...prev,
            syncStatus: SyncStatus.SYNC,
          }))
          if (!netInfoState.isConnected) {
            Toast.show({
              type: 'info',
              text1: 'Will upload when connected',
              position: 'bottom',
              bottomOffset: 0,
            })
            return
          }
          try {
            //await AddBoxs()
          } catch (error) {
            Alert.alert('Warning', error)
            return
          }
          try {
            Toast.show({
              type: 'info',
              text1: 'Upload...',
              position: 'bottom',
              bottomOffset: 0,
            })
            // await uploadAssetsInBackground({
            //   callback: success => {
            //     if (success)
            //       setAsset(prev => ({
            //         ...prev,
            //         syncStatus: SyncStatus.SYNCED,
            //       }))
            //     else
            //       Toast.show({
            //         type: 'error',
            //         text1: 'Will upload when connected',
            //         position: 'bottom',
            //         bottomOffset: 0,
            //       })
            //   },
            // })
          } catch (error) {
            Alert.alert(
              'Error',
              'Unable to send the file now, will upload when connected',
            )
          }
        } catch (error) {
          console.log('uploadOrDownload', error)
          Alert.alert(
            'Error',
            'Unable to send the file, make sure your box is available!',
          )
        } finally {
          setLoading(false)
        }
      }, 0)
    } else if (asset?.syncStatus === SyncStatus.SYNC) {
      cancelUpdate()
    }
  }

  const animatedOptionsStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }))

  const renderHeader = useCallback(
    () => (
      <Animated.View
        style={[
          {
            zIndex: 10,
            position: 'absolute',
            width: '100%',
          },
          animatedOptionsStyle,
        ]}
      >
        <StatusBar backgroundColor="transparent" />
        <LinearGradient
          colors={[
            'rgba(33,33,33,0.3)',
            'rgba(33,33,33,0.2)',
            'rgba(33,33,33,0)',
          ]}
          style={[
            styles.gradientContainer,
            { alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 20 },
          ]}
        >
          <HeaderArrowBack
            navigation={navigation}
            iconProps={{
              onPress: goBack,
            }}
          />
        </LinearGradient>
      </Animated.View>
    ),
    [navigation, loading, uploadToBox, asset, goBack],
  )

  const shareWithDID = async () => {
    if (!DID) return
    setSharing(true)
    try {
      const shareAsset = (await Assets.getById(asset.id))?.[0]
      const myDID = await helper.getMyDID()
      if (myDID && shareAsset) {
        const myTag = new TaggedEncryption(myDID.did)
        const symetricKey = (
          await helper.decryptJWE(myDID.did, JSON.parse(shareAsset?.jwe))
        )?.symetricKey
        const jwe = await myTag.encrypt(symetricKey, symetricKey?.id, [DID])
        Share.share({
          title: 'Fx Fotos | Just shared an asset',
          // eslint-disable-next-line no-undef
          message: `https://fotos.fx.land/shared/${Buffer.from(
            JSON.stringify(jwe),
            'utf-8',
          ).toString('base64')}`,
        })
      }
    } catch (error) {
      Alert.alert('Error', error.toString())
      console.log(error)
    } finally {
      setSharing(false)
      setShowShareBottomSheet(false)
    }
  }

  // const downloadFromBox = async () => {
  //   if (asset?.syncStatus === SyncStatus.SYNCED && asset?.isDeleted) {
  //     setLoading(true)
  //     setTimeout(async () => {
  //       try {
  //         try {
  //           await AddBoxs()
  //         } catch (error) {
  //           Alert.alert('Warning', error)
  //           return
  //         }
  //         const myDID = await helper.getMyDID()
  //         let fileRef = null
  //         if (myDID) {
  //           const jwe = JSON.parse(asset?.jwe)
  //           fileRef = (await helper.decryptJWE(myDID.did, jwe))?.symetricKey
  //         }
  //         let result = null
  //         if (fileRef) {
  //           result = await downloadAndDecryptAsset(fileRef)
  //         } else {
  //           result = await downloadAsset(asset?.cid)
  //         }
  //         if (result) {
  //           setAsset(prev => ({
  //             ...prev,
  //             uri: result.uri,
  //             isDeleted: false,
  //           }))
  //           Assets.addOrUpdate([
  //             {
  //               id: asset.id,
  //               uri: result.uri,
  //               isDeleted: false,
  //             },
  //           ])
  //         }
  //       } catch (error) {
  //         console.log('uploadOrDownload', error)
  //         Alert.alert(
  //           'Error',
  //           'Unable to receive the file, make sure your box is available!',
  //         )
  //       } finally {
  //         setLoading(false)
  //       }
  //     }, 0)
  //   }
  // }

  // const renderDownloadSection = useCallback(
  //   () => (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //       }}
  //     >
  //       <Card
  //         containerStyle={{
  //           borderWidth: 0,
  //         }}
  //       >
  //         <Icon
  //           type="material-community"
  //           name="cloud-download-outline"
  //           size={78}
  //           onPress={downloadFromBox}
  //         />
  //         <Card.Title>Tap to download</Card.Title>
  //       </Card>
  //     </View>
  //   ),
  //   [downloadFromBox],
  // )

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { x: xOffset } = event.nativeEvent.contentOffset
      const imageWidth = windowDims.width
      const index = Math.round(xOffset / imageWidth)
      const newAsset = dataProvider.getDataForIndex(index)
      if (currentAssetRef.current.id == newAsset.id) return
      currentAssetRef.current = newAsset
      setExtendedState(prev => ({
        ...prev,
        currentAssetId: newAsset.id,
      }))
      setTimeout(() => {
        assetSections.forEach(section => {
          if (section.id === currentAssetRef.current.id) {
            scrollToItem?.(section, false)
          }
        })
      })
    },
    [windowDims.width],
  )

  const renderActionButtons = useCallback(
    () => (
      <Animated.View
        onLayout={event => {
          footerHeightRef.current = event.nativeEvent.layout.height
        }}
        style={[styles.actionButtonContainer, animatedOptionsStyle]}
      >
        <LinearGradient
          colors={[
            'rgba(33,33,33,0)',
            'rgba(33,33,33,0.2)',
            'rgba(33,33,33,0.3)',
          ]}
          style={styles.gradientContainer}
        >
          <TouchableOpacity style={styles.iconContainer} onPress={deleteAsset}>
            <Icon
              name="delete"
              type="material-community"
              size={30}
              color={palette.white}
            />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    ),
    [],
  )

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
    opacity: screenOpacity.value,
  }))
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <Animated.View style={wrapperAnimatedStyle}>
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <NativeViewGestureHandler ref={listGestureRef}>
            <RecyclerListView
              ref={rclRef}
              isHorizontal
              initialRenderIndex={initialIndexRef.current}
              style={{ flex: 1 }}
              layoutProvider={layoutProvider}
              dataProvider={dataProvider}
              rowRenderer={rowRenderer}
              renderAheadOffset={5}
              scrollViewProps={{
                scrollEnabled,
                pagingEnabled: true,
                onMomentumScrollEnd,
                showsHorizontalScrollIndicator: false,
                showsVerticalScrollIndicator: false,
              }}
              extendedState={extendedState}
            />
          </NativeViewGestureHandler>
          {transitionDone || (
            <View style={styles.mockContainer}>
              <GalleryImage
                asset={asset}
                sharedElementId={asset.id}
                enableParentScroll={enableScroll}
                disableParentScroll={disableScroll}
                listGestureRef={listGestureRef}
                screenOpacity={screenOpacity}
              />
            </View>
          )}
          {renderActionButtons()}
          <BottomSheet
            isVisible={showShareBottomSheet}
            onBackdropPress={() => setShowShareBottomSheet(false)}
            modalProps={{
              transparent: true,
              animationType: 'fade',
            }}
            containerStyle={styles.bottomSheetContainer}
          >
            <Card
              containerStyle={{
                borderWidth: 0,
                margin: 0,
              }}
            >
              <Card.Title>Share with (enter DID)</Card.Title>
              <Input
                onChangeText={txt => setDID(txt)}
                onEndEditing={shareWithDID}
              />
            </Card>
            <Button
              title={
                sharing ? (
                  <ActivityIndicator
                    style={styles.activityIndicatorStyle}
                    size="small"
                  />
                ) : (
                  'Share'
                )
              }
              onPress={shareWithDID}
            />
          </BottomSheet>
        </View>
      </Animated.View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    marginHorizontal: 10,
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(189,189,189,.2)',
  },
  activityIndicatorStyle: {
    padding: 5,
  },
  actionText: {
    textAlign: 'center',
    color: palette.white,
    fontSize: 13,
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  gradientContainer: {
    paddingHorizontal: 7,
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'center',
  },
})
