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
import * as Constances from '../utils/constants'
import { reject } from 'lodash'
import { Helper, DeviceUtils, KeyChain } from '../utils'

// import * as helper from '../utils/helper'

type TaskParams = {
  callback: (success: boolean, error: Error) => void
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

const backgroundTask = async (taskParameters: TaskParams) => {
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
    )
  }
  const { callback = null, assets = [] } = taskParameters
  const updateAssets: AssetEntity[] = []

  try {
    const fulaConfig = await initFula()
    if (fulaConfig) {
      Helper.storeFulaPeerId(fulaConfig.peerId)
      Helper.storeFulaRootCID(fulaConfig.rootCid)
    }

    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index]

      // Prepare task notification message
      await BackgroundJob.updateNotification({
        taskTitle: `Uploading asset #${index + 1}/${assets.length}`,
        taskDesc: `Syncing your assets ...`,
        progressBar: {
          max: assets.length,
          value: index,
          indeterminate: assets.length == 1,
        },
      })

      // Prepare the filepath and filename
      const _filePath = asset.uri?.split('file:')[1]
      let filename = asset?.filename
      if (!filename) {
        const slashSplit = asset.uri?.split('/')
        filename = slashSplit[slashSplit?.length - 1]
      }
      // Upload file to the WNFS
      const cid = await fula.writeFile(
        `${Constances.FOTOS_WNFS_ROOT}/${filename}`,
        _filePath,
      )

      //Update asset record in database
      updateAssets.push({
        id: asset.id,
        cid: cid,
        syncDate: new Date(),
        syncStatus: SyncStatus.SYNCED,
      })

      //return the callback function
      try {
        callback?.(true)
      } catch {}
    }
  } catch (error) {
    console.log('backgroundTask:', error)
    try {
      callback?.(false, error)
    } catch {}
  } finally {
    Assets.addOrUpdate(updateAssets)
    await BackgroundJob.stop()
  }
}
// /**
//  * You need to make sure the box addresses are added and then call this method
//  * @param options
//  */
export const uploadAssetsInBackground = async (options: {
  callback?: (success: boolean) => void
}) => {
  try {
    if (!BackgroundJob.isRunning()) {
      const assets = await Assets.getAllNeedToSync()
      if (assets.length) {
        await BackgroundJob.start<TaskParams>(backgroundTask, {
          ...defaultOptions,
          parameters: {
            callback: options?.callback,
            assets,
          },
        })
      }
    }
  } catch (e) {
    console.log('Error', e)
    await BackgroundJob.stop()
  }
}

export const downloadAsset = async ({
  filename,
  localStorePath = null,
}: {
  filename: string
  localStorePath: string | null
}) => {
  try {
    if (!localStorePath) {
      localStorePath = `${DeviceUtils.DocumentDirectoryPath}/fula/${filename}`
    }
    console.log(
      'downloadAsset',
      `${Constances.FOTOS_WNFS_ROOT}/${filename}`,
      localStorePath,
    )
    const filePath = await fula.readFile(
      `${Constances.FOTOS_WNFS_ROOT}/${filename}`,
      localStorePath,
    )
    return `file://${filePath}`
  } catch (e) {
    console.log('Error', e)
    throw e
  }
}

/**
 *
 * @param folders List of folders you want to set their assets as SYNC, If leave it empty all autoBackup folders will be included
 */
export const setAutoBackupAssets = async (folders: string[] | undefined) => {
  let uris = []
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
  exchange?: string | null
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
    )
    return fulaInit
  } catch (error) {
    console.log('fulaInit Error', error)
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
