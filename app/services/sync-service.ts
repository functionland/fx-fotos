// import BackgroundFetch, { HeadlessEvent } from 'react-native-background-fetch'
import { Platform } from 'react-native'
import BackgroundJob, {
  BackgroundTaskOptions,
} from 'react-native-background-actions'
import { fula, chainApi, blockchain } from '@functionland/react-native-fula'
// import { TaggedEncryption } from '@functionland/fula-sec'
import { AssetEntity } from '../realmdb/entities'
import { SyncStatus } from '../types'
import { Assets, Boxs, FolderSettings } from './localdb/index'
import * as Constants from '../utils/constants'
import { Helper, DeviceUtils, KeyChain } from '../utils'
import { ApiPromise } from '@polkadot/api'
import * as helper from '../utils/helper'
import AsyncStorage from '@react-native-async-storage/async-storage';

type TaskParams = {
  callback?: (success: boolean, assetId: string, error?: Error) => void
  assets: AssetEntity[]
  api?: ApiPromise
  fulaAccountSeed?: string
  fulaPoolId?: number
  fulaReplicationFactor?: number
}
const defaultOptions = {
  taskName: 'BackgroundSyncTask',
  taskTitle: 'Preparing upload...',
  taskDesc: '',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#2196f3',
  linkingURI: 'fotos://',
} as BackgroundTaskOptions

const uploadingAssets = new Set()

const sleep = async(ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const uploadAssetBackgroundTask = async (taskParameters?: TaskParams) => {
  console.log('uploadAssetBackgroundTask started')
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
    )
  }
  const storeCid = async (cid) => {
    try {
      await AsyncStorage.setItem('@lastUploadedCid', cid);
    } catch (e) {
      // saving error
    }
  };
  let {
    callback = null,
    assets = [],
    api = undefined,
    fulaAccountSeed = '',
    fulaPoolId = 0,
    fulaReplicationFactor = 0,
  } = taskParameters || {}
  let fulaAccount = ''
  let gasBalance = 0

  try {
    console.log('uploadAssetBackgroundTask...')
    let fulaConfig = await initFula()
    if (fulaConfig) {
      Helper.storeFulaPeerId(fulaConfig.peerId)
      Helper.storeFulaRootCID(fulaConfig.rootCid)
    }
    console.log('uploadAssetBackgroundTask fulaConfig')
    console.log(fulaConfig)
    try {
      if (!api) {
        api = await chainApi.init()
        fulaAccount = await chainApi.getAccountIdFromSeed(fulaAccountSeed)
        while (gasBalance <= 10000000000000000000) {
          let gasBalanceStr = await chainApi.checkAccountBalance(api, fulaAccount)
          if (gasBalanceStr) {
            gasBalance = parseInt(gasBalanceStr)
          }
          if (gasBalance <= 10000000000000000000){
            await BackgroundJob.updateNotification({
              taskTitle: `Waiting for enough gas balance in ${fulaAccount}`,
              taskDesc: `Uploads are resumed as soon as gas balance is enough ...`,
              progressBar: {
                max: 100,
                value: 0,
                indeterminate: true,
              },
            })
          }
          await sleep(10000);
        }
      }
    } catch (e) {
      console.error("Error happened in initializing chainApi")
    }

    for (let index = 0; index < assets?.length; index++) {
      const asset = assets[index]
      console.log('uploadAssetBackgroundTask asset...', index)

      //Ignore asset greater than 200 MB
      if (!asset?.fileSize || asset?.fileSize > 200 * 1000 * 1000) {
        console.log('Ignore large asset ...', asset)
        continue
      }

      // Prepare task notification message
      if (BackgroundJob.isRunning()) {
        console.log("BackgroundJob.isRunning")
        await BackgroundJob.updateNotification({
          taskTitle: `Uploading asset #${index + 1}/${assets?.length}`,
          taskDesc: `Syncing your assets ...`,
          progressBar: {
            max: assets?.length,
            value: index,
            indeterminate: assets?.length == 1,
          },
        })
      }

      // Prepare the filepath and filename
      const _filePath = asset.uri?.split('file:')[1]
      let filename = asset?.filename
      if (!filename) {
        const slashSplit = asset.uri?.split('/')
        filename = slashSplit
          ? slashSplit[slashSplit?.length - 1]
          : 'unknown' + index
      }
      console.log("filename="+filename)
      console.log(asset.uri)
      console.log("_filePath="+_filePath)
      // Upload file to the WNFS
      if (_filePath) {
        console.log("calling fula.writeFile writting in "+`${Constants.FOTOS_WNFS_ROOT}/${filename}`)
        const cid = await fula.writeFile(
          `${Constants.FOTOS_WNFS_ROOT}/${filename}`,
          _filePath,
        )
        storeCid(cid);
        console.log("cid="+cid)
        await Helper.storeFulaRootCID(cid)
        //Update asset record in database
        const newAsset = {
          id: asset.id,
          cid: cid,
          syncDate: new Date(),
          syncStatus: SyncStatus.SYNCED,
        }
        console.log("newAsset")
        console.log(newAsset)
        Assets.addOrUpdate([newAsset])

        //return the callback function
        /*
          // Now calling thi part after pool replication
          try {
            callback?.(true, asset.id)
          } catch (e) {
            console.log('error happened in calling callback')
            console.log(e)
          }
        */
      } else {
        console.log("filepath could not be found")
      }
    }
    try {
      //TODO: Replicate request should be sent to blockchain
      let storedCids = await fula.listRecentCidsAsString()
      if (api && storedCids.length && fulaPoolId && fulaReplicationFactor) {
        console.log("calling batchUploadManifest")
        console.log(storedCids)
        let res = await fula.replicateRecentCids(
          api,
          fulaAccountSeed,
          fulaPoolId,
          fulaReplicationFactor,
        )
        if (res && res.status && res.cids.length) {
          console.log(res)
          if ((!fulaAccount || fulaAccount == "") && fulaAccountSeed) {
            fulaAccount = await chainApi.getAccountIdFromSeed(fulaAccountSeed)
          }
          console.log("accontId before sending replicate request is :"+fulaAccount)
          let res2 = await blockchain.replicateInPool(res.cids, fulaAccount, fulaPoolId)
          if (res2.length) {
            await fula.clearCidsFromRecent()
            try {
              for (let index = 0; index < assets?.length; index++) {
                const asset = assets[index]
                if (asset.cid && res2.includes(asset.cid)) {
                  callback?.(true, asset.id)
                } else {
                  callback?.(false, "Asset was not replicated in the pool")
                }
              }
            } catch {
              /* empty */
            }
          }
        }
      } else {
        console.log("not calling batchUploadManifest")
        console.log({api:api, storedCids:storedCids, fulaPoolId:fulaPoolId, fulaReplicationFactor: fulaReplicationFactor})
      }
    } catch (error) {
      console.log('upload to Fula network failed: ' + error)
    }
  } catch (error) {
    console.log('uploadAssetBackgroundTask:', error)
    try {
      callback?.(false, error)
    } catch {
      /* empty */
    }
  } finally {
    await BackgroundJob.stop()
  }
}
/**
 * Download assets from the Blox
 * @param taskParameters
 */
const downloadAssetsBackgroundTask = async (taskParameters?: TaskParams) => {
  const { callback = null, assets = [] } = taskParameters || {}

  try {
    console.log('downloadAssetsBackgroundTask...')
    const fulaConfig = await initFula()
    if (fulaConfig) {
      Helper.storeFulaPeerId(fulaConfig.peerId)
      Helper.storeFulaRootCID(fulaConfig.rootCid)
    }

    for (let index = 0; index < assets?.length; index++) {
      console.log('downloadAssetsBackgroundTask asset...', index)

      try {
        const asset = assets[index]

        // Prepare task notification message
        if (BackgroundJob.isRunning()) {
          await BackgroundJob.updateNotification({
            taskTitle: `Downloading asset #${index + 1}/${assets?.length}`,
            taskDesc: `Download your assets ...`,
            progressBar: {
              max: assets?.length,
              value: index,
              indeterminate: assets?.length == 1,
            },
          })
        }

        if (!asset?.filename) continue
        const path = await downloadAsset({
          filename: asset.filename,
        })

        //Update asset record in database
        const newAsset = {
          id: asset.id,
          uri: path,
          syncDate: new Date(),
          isDeleted: false,
          syncStatus: SyncStatus.Saved,
        }
        Assets.addOrUpdate([newAsset])
        //return the callback function
        try {
          callback?.(true, asset.id)
        } catch {
          /* empty */
        }
      } catch (error) {
        console.log('downloadAssetsBackgroundTask asset:', assets[index])
      }
    }
  } catch (error) {
    console.log('downloadAssetsBackgroundTask:', error)
    try {
      callback?.(false, error)
    } catch {
      /* empty */
    }
  } finally {
    await BackgroundJob.stop()
  }
}
// /**
//  * You need to make sure the box addresses are added and then call this method
//  * @param options
//  */
export const uploadAssetsInBackground = async (options?: {
  callback?: (success: boolean) => void
}) => {
  try {
    console.log('uploadAssetsInBackground...')
    while (BackgroundJob.isRunning()) {
      console.log('wating uploadAssetsInBackground...')
      await Helper.sleep(10 * 1000)
    }
    let assets = await Assets.getAllNeedToSync()
    // Filter out assets that are already being uploaded
    assets = assets.filter(asset => {
      if (uploadingAssets.has(asset.id)) {
        return false
      }
      uploadingAssets.add(asset.id)
      return true
    })
    if (!assets.length) {
      console.log('No new assets to upload.')
      return
    }
    console.log('uploadAssetsInBackground assets')
    let fulaAccountSeed = ''
    const fulaAcountSeedObj = await helper.getFulaAccountSeed()
    if (fulaAcountSeedObj) {
      fulaAccountSeed = fulaAcountSeedObj.password
    }
    console.log('creating  uploadCallback')
    const uploadCallback = (success, assetId) => {
      uploadingAssets.delete(assetId)
      if (options?.callback) {
        options.callback(success)
      }
    }
    console.log('uploadAssetsInBackground fulaAccountSeed')
    console.log(fulaAccountSeed)
    let fulaPoolId = 0
    const fulaPoolIdObj = await helper.getFulaPoolId()
    console.log('uploadAssetsInBackground fulaPoolIdObj')
    console.log(fulaPoolIdObj)
    if (fulaPoolIdObj) {
      fulaPoolId = parseInt(fulaPoolIdObj.password, 10)
    }
    console.log('uploadAssetsInBackground fulaPoolId')
    console.log(fulaPoolId)
    const fulaReplicationFactor = 6
    let api = await chainApi.init()
    console.log('api was initialized')

    if (!BackgroundJob.isRunning()) {
      if (assets?.length) {
        await BackgroundJob.start<TaskParams>(uploadAssetBackgroundTask, {
          ...defaultOptions,
          parameters: {
            callback: uploadCallback,
            assets,
            fulaAccountSeed,
            fulaPoolId,
            fulaReplicationFactor,
            api,
          },
        })
      }
    }

  } catch (e) {
    await BackgroundJob.stop()
    console.log('Error in uploadAssetsInBackground:', e)
  }
}

export const downloadAssetsInBackground = async (options?: {
  callback?: (success: boolean) => void
}) => {
  try {
    console.log('downloadAssetsInBackground...')
    //Wait until background jobs finished
    while (BackgroundJob.isRunning()) {
      console.log('waiting downloadAssetsInBackground...')
      await Helper.sleep(10 * 1000)
    }
    if (!BackgroundJob.isRunning()) {
      const assets = await Assets.getAllNeedToDownload()
      if (assets?.length) {
        await BackgroundJob.start<TaskParams>(downloadAssetsBackgroundTask, {
          ...defaultOptions,
          taskName: 'downloadAssetsBackgroundTask',
          taskTitle: 'Preparing download...',
          parameters: {
            callback: options?.callback,
            assets,
          },
        })
      }
    }
  } catch (e) {
    await BackgroundJob.stop()
    console.log('Error in downloadAssetsInBackground: ', e)
  }
}

export const downloadAsset = async ({
  filename,
  localStorePath,
}: {
  filename: string
  localStorePath?: string
}) => {
  try {
    if (!localStorePath) {
      localStorePath = `${DeviceUtils.DocumentDirectoryPath}/fula/${filename}`
    }
    console.log(
      'downloadAsset',
      `${Constants.FOTOS_WNFS_ROOT}/${filename}`,
      localStorePath,
    )
    const filePath = await fula.readFile(
      `${Constants.FOTOS_WNFS_ROOT}/${filename}`,
      localStorePath,
    )
    return `file://${filePath}`
  } catch (e) {
    console.log('Error in downloadAsset: ', e)
    throw e
  }
}

/**
 *
 * @param folders List of folders you want to set their assets as SYNC, If leave it empty all autoBackup folders will be included
 */
export const setAutoBackupAssets = async (folders?: string[] | undefined) => {
  let uris: string[] = []
  if (!folders?.length) {
    uris = (await FolderSettings.getAllAutoBackups())?.map(
      folder => `/${folder.name}/`,
    )
  } else {
    uris = folders.map(folder => `/${folder}/`)
  }

  if (uris?.length) {
    const assets = await Assets.getAll({
      filter: `isDeleted=false AND syncStatus=${SyncStatus.NOTSYNCED}`,
      uris,
    })

    await Assets.addOrUpdate(
      assets.map(asset => ({
        id: asset.id,
        syncStatus: SyncStatus.SYNC,
      })),
    )
  }
}

export const unSetAutoBackupAssets = async (folders: string[]) => {
  let uris = folders?.map(folder => `/${folder}/`)

  if (uris?.length) {
    const assets = await Assets.getAll({
      filter: `isDeleted=false AND syncStatus=${SyncStatus.SYNC}`,
      uris,
    })

    await Assets.addOrUpdate(
      assets.map(asset => ({
        id: asset.id,
        syncStatus: SyncStatus.NOTSYNCED,
      })),
    )
  }
}
interface FulaConfig {
  identity?: string | null
  storePath?: string | null
  bloxAddr?: string | null
  exchange?: string
  autoFlush?: boolean
  rootCID?: string | null
}
export const initFula = async (
  config?: FulaConfig,
): Promise<
  { peerId: string; rootCid: string; } | undefined
> => {
  console.log("called initFula")
  try {
    let {
      identity = null,
      storePath = null,
      bloxAddr = null,
      exchange = 'blox',
      autoFlush = true,
      rootCID = null,
    } = config || {}

    const isReady = await fula.isReady()
    //if (isReady) return

    if (!identity) {
      const didCredentialsObj = await KeyChain.load(
        KeyChain.Service.DIDCredentials,
      )
      if (didCredentialsObj) {
        const keyPair = Helper.getMyDIDKeyPair(
          didCredentialsObj.username,
          didCredentialsObj.password,
        )
        identity = keyPair.secretKey.toString()
      } else throw Error('Could not find default identity from KeyChain!')
    }
    if (!rootCID) {
      const fulaRootObject = await KeyChain.load(
        KeyChain.Service.FULARootObject,
      )
      if (fulaRootObject) {
        rootCID = fulaRootObject.password
      }
    }
    if (!storePath) {
      storePath = `${DeviceUtils.DocumentDirectoryPath}/wnfs`
    }
    if (!bloxAddr) {
      const box = (await Boxs.getAll())?.[0]
      if (box) {
        bloxAddr = Helper.generateBloxAddress(box)
      } else {
          let _poolCreator = ''
          let _poolId = '0'
          const fulaPoolCreatorObj = await helper.getFulaPoolCreator()
          if (fulaPoolCreatorObj) {
            _poolCreator = fulaPoolCreatorObj.password
          }
          const fulaPoolIdObj = await helper.getFulaPoolId()
          if (fulaPoolIdObj) {
            _poolId = fulaPoolIdObj.password
          }
          if (_poolCreator && _poolId !== '0') {
            bloxAddr = Helper.generatePoolAddress(_poolId, _poolCreator)
          }
      }
      if (!bloxAddr) {
        throw Error('Could not find default blox address!')
      }
      console.log('blox Address created: '+ bloxAddr)
    }
    console.log('identity:')
    console.log(identity)
    const fulaInit = await fula.init(
      identity, //bytes of the privateKey of did identity in string format
      storePath, // leave empty to use the default temp one
      bloxAddr,
      exchange,
      autoFlush,
      rootCID,
      true,
      true,
    )
    console.log('init complete');
    console.log(fulaInit);
    return fulaInit
  } catch (error) {
    console.log('fulaInit Error', error)
  }
}
interface FulaAccountConfig {
  fulaAccount?: string | null
  fulaAccountSeed?: string | null
  identity?: string | null
}
export const initFulaAccount = async (
  accountConfig: FulaAccountConfig,
): Promise<{ fulaAccount: string; fulaAccountSeed: string } | undefined> => {
  try {
    let {
      fulaAccount = null,
      fulaAccountSeed = null,
      identity = null,
    } = accountConfig || {}
    if (!fulaAccount || !fulaAccountSeed) {
      if (!identity) {
        const didCredentialsObj = await KeyChain.load(
          KeyChain.Service.DIDCredentials,
        )
        if (didCredentialsObj) {
          const keyPair = Helper.getMyDIDKeyPair(
            didCredentialsObj.username,
            didCredentialsObj.password,
          )
          identity = keyPair.secretKey.toString()
          fulaAccountSeed = await chainApi.createHexSeedFromString(identity)
          fulaAccount = chainApi.getLocalAccount(fulaAccountSeed)?.account
        } else throw new Error('Could not find default identity from KeyChain!')
      } else {
        fulaAccountSeed = await chainApi.createHexSeedFromString(identity)
        fulaAccount = chainApi.getLocalAccount(fulaAccountSeed)?.account
      }
    }

    if (!fulaAccountSeed) {
      throw new Error('Could not find default accountSeed!')
    }
    return Promise.resolve({
      fulaAccount: fulaAccount,
      fulaAccountSeed: fulaAccountSeed,
    })
  } catch (error) {
    console.log('initAccount Error', error)
    return Promise.reject(error)
  }
}

export const deleteAsset = async (filename: string) => {
  try {
    await initFula()
    const rootCid = await fula.rm(`${Constants.FOTOS_WNFS_ROOT}/${filename}`)
    Helper.storeFulaRootCID(rootCid)
  } catch (error) {
    console.log('deleteAsset from Blox:', error)
    throw error
  }
}

// /// Configure BackgroundFetch.
// ///
// export const initBackgroundFetch = async () =>
//   await BackgroundFetch.configure(
//     {
//       minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
//       stopOnTerminate: false,
//       enableHeadless: true,
//       startOnBoot: true,
//       // Android options
//       forceAlarmManager: false, // <-- Set true to bypass JobScheduler.
//       requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
//       requiresCharging: false, // Default
//       requiresDeviceIdle: false, // Default
//       requiresBatteryNotLow: true, // Default
//       requiresStorageNotLow: false, // Default
//     },
//     async (taskId: string) => {
//       console.log('[BackgroundFetch (configure)] taskId', taskId)
//       await backgroundFetchHeadlessTask({ taskId, timeout: false })

//       BackgroundFetch.finish(taskId)
//     },
//     (taskId: string) => {
//       // Oh No!  Our task took too long to complete and the OS has signalled
//       // that this task must be finished immediately.
//       console.log('[Fetch] TIMEOUT taskId:', taskId)
//       BackgroundFetch.finish(taskId)
//     },
//   )

// /// BackgroundFetch Android Headless Event Receiver.
// /// Called when the Android app is terminated.
// ///
// export const backgroundFetchHeadlessTask = async (event: HeadlessEvent) => {
//   if (event.timeout) {
//     console.log('[BackgroundFetch] 💀 HeadlessTask TIMEOUT: ', event.taskId)
//     BackgroundFetch.finish(event.taskId)
//     return
//   }

//   console.log('[BackgroundFetch] 💀 HeadlessTask start: ', event.taskId)
//   await uploadAssetsInBackground()

//   // Required:  Signal to native code that your task is complete.
//   // If you don't do this, your app could be terminated and/or assigned
//   // battery-blame for consuming too much time in background.
//   BackgroundFetch.finish(event.taskId)
// }
