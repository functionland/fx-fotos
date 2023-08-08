// import BackgroundFetch, { HeadlessEvent } from 'react-native-background-fetch'
import { Platform } from 'react-native'
import BackgroundJob, {
  BackgroundTaskOptions,
} from 'react-native-background-actions'
import { fula } from '@functionland/react-native-fula'
// import { TaggedEncryption } from '@functionland/fula-sec'
import { AssetEntity } from '../realmdb/entities'
import { SyncStatus } from '../types'
import { Assets, Boxs, FolderSettings } from './localdb/index'
import * as Constants from '../utils/constants'
import { Helper, DeviceUtils, KeyChain } from '../utils'

// import * as helper from '../utils/helper'

type TaskParams = {
  callback?: (success: boolean, error?: Error) => void
  assets: AssetEntity[]
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

const uploadAssetBackgroundTask = async (taskParameters?: TaskParams) => {
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
    )
  }
  const { callback = null, assets = [] } = taskParameters || {}

  try {
    console.log('uploadAssetBackgroundTask...')

    const fulaConfig = await initFula()
    if (fulaConfig) {
      Helper.storeFulaPeerId(fulaConfig.peerId)
      Helper.storeFulaRootCID(fulaConfig.rootCid)
    }

    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index]
      console.log('uploadAssetBackgroundTask asset...', index)

      //Ignore asset greater than 200 MB
      if (!asset?.fileSize || asset.fileSize > 200 * 1000 * 1000) {
        console.log('Ignore large asset ...', asset)
        continue
      }

      // Prepare task notification message
      if (BackgroundJob.isRunning()) {
        await BackgroundJob.updateNotification({
          taskTitle: `Uploading asset #${index + 1}/${assets.length}`,
          taskDesc: `Syncing your assets ...`,
          progressBar: {
            max: assets.length,
            value: index,
            indeterminate: assets.length == 1,
          },
        })
      }

      // Prepare the filepath and filename
      const _filePath = asset.uri?.split('file:')[1]
      let filename = asset?.filename
      if (!filename) {
        const slashSplit = asset.uri?.split('/')
        filename = slashSplit[slashSplit?.length - 1]
      }
      // Upload file to the WNFS
      const cid = await fula.writeFile(
        `${Constants.FOTOS_WNFS_ROOT}/${filename}`,
        _filePath,
      )
      await Helper.storeFulaRootCID(cid)
      //Update asset record in database
      const newAsset = {
        id: asset.id,
        cid: cid,
        syncDate: new Date(),
        syncStatus: SyncStatus.SYNCED,
      }
      Assets.addOrUpdate([newAsset])

      //return the callback function
      try {
        callback?.(true)
      } catch {
        /* empty */
      }
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

    for (let index = 0; index < assets.length; index++) {
      console.log('downloadAssetsBackgroundTask asset...', index)

      try {
        const asset = assets[index]

        // Prepare task notification message
        if (BackgroundJob.isRunning()) {
          await BackgroundJob.updateNotification({
            taskTitle: `Downloading asset #${index + 1}/${assets.length}`,
            taskDesc: `Download your assets ...`,
            progressBar: {
              max: assets.length,
              value: index,
              indeterminate: assets.length == 1,
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
          callback?.(true)
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
    const assets = await Assets.getAllNeedToSync()
    if (!BackgroundJob.isRunning()) {
      if (assets.length) {
        await BackgroundJob.start<TaskParams>(uploadAssetBackgroundTask, {
          ...defaultOptions,
          parameters: {
            callback: options?.callback,
            assets,
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
      if (assets.length) {
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
  { peerId: string; rootCid: string; private_ref: string } | undefined
> => {
  try {
    let {
      identity = null,
      storePath = null,
      bloxAddr = null,
      exchange = '',
      autoFlush = false,
      rootCID = null,
    } = config || {}

    const isReady = await fula.isReady()
    if (isReady) return

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
      } else throw 'Could not find default identity from KeyChain!'
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
      } else throw 'Could not find default blox address!'
    }
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
    return fulaInit
  } catch (error) {
    console.log('fulaInit Error', error)
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
