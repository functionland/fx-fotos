// import BackgroundFetch, { HeadlessEvent } from 'react-native-background-fetch'
import { Platform } from 'react-native'
import BackgroundJob, {
  BackgroundTaskOptions,
} from 'react-native-background-actions'
import { fula } from '@functionland/react-native-fula'
// import { TaggedEncryption } from '@functionland/fula-sec'
import { AssetEntity } from '../realmdb/entities'
import { SyncStatus } from '../types'
import { Assets, Boxs } from './localdb/index'
import * as Constances from './../utils/constance'
import { reject } from 'lodash'
import deviceUtils from '../utils/deviceUtils'
// import * as helper from '../utils/helper'

type TaskParams = {
  callback: (success: boolean) => void
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
  linkingURI: 'exampleScheme://chat/jane',
} as BackgroundTaskOptions

const backgroundTask = async (taskParameters: TaskParams) => {
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
    )
  }
  const { callback = null, assets = [] } = taskParameters
  try {
    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index]

      // Prepare task notification message
      BackgroundJob.updateNotification({
        taskTitle: `Upload asset #${index + 1}`,
        taskDesc: `Total: ${assets.length}`,
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
      Assets.addOrUpdate([
        {
          id: asset.id,
          cid: cid,
          syncDate: new Date(),
          syncStatus: SyncStatus.SYNCED,
        },
      ])

      //return the callback function
      try {
        callback?.(true)
      } catch {}
    }
  } catch (error) {
    console.log('backgroundTask:', error)
    try {
      callback?.(false)
    } catch {}
  } finally {
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
    const assets = await Assets.getAllNeedToSync()
    if (assets.length) {
      await BackgroundJob.stop()
      if (!BackgroundJob.isRunning())
        await BackgroundJob.start<TaskParams>(backgroundTask, {
          ...defaultOptions,
          parameters: {
            callback: options?.callback,
            assets,
          },
        })
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
      localStorePath = `${deviceUtils.DocumentDirectoryPath}/fula/${filename}`
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
