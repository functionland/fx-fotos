import { Platform } from "react-native"
import BackgroundJob, { BackgroundTaskOptions } from "react-native-background-actions"
import BackgroundFetch, { HeadlessEvent } from "react-native-background-fetch"
import { file, fula } from "react-native-fula"

import { AssetEntity } from "../realmdb/entities"
import { SyncStatus } from "../types"
import { Assets, Boxs } from "./localdb/index"
import { addAssetMeta } from "./remote-db-service"
import { TaggedEncryption } from "@functionland/fula-sec"
import * as helper from "../utils/helper"
type TaskParams = {
  callback: (success: boolean) => void
  assets: AssetEntity[]
}
const defaultOptions = {
  taskName: "BackgroundSyncTask",
  taskTitle: "Preparing upload...",
  taskDesc: "",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap",
  },
  color: "#2196f3",
  linkingURI: "exampleScheme://chat/jane",
} as BackgroundTaskOptions

const backgroundTask = async (taskParameters: TaskParams) => {
  if (Platform.OS === "ios") {
    console.warn(
      "This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,",
      "geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.",
    )
  }
  const { callback = null, assets = [] } = taskParameters
  let taggedEncryption: TaggedEncryption = null
  const myDID = await helper.getMyDID()
  if (myDID) {
    taggedEncryption = new TaggedEncryption(myDID?.did)
  }
  await new Promise(async (resolve) => {
    try {
      for (let index = 0; index < assets.length; index++) {
        const asset = assets[index]
        BackgroundJob.updateNotification({
          taskTitle: `Upload asset #${index + 1}`,
          taskDesc: `Total: ${assets.length}`,
          progressBar: {
            max: assets.length,
            value: index,
            indeterminate: assets.length == 1,
          },
        })

        if (myDID) {
          const result = await encryptAndUploadAsset(asset)
          const jwe = await taggedEncryption.encrypt(result, result?.id, [myDID?.authDID])
          await addAssetMeta({
            id: result.id,
            name: asset.filename,
            jwe,
            date: asset.modificationTime,
            ownerId: myDID?.authDID,
          })
          Assets.addOrUpdate([
            {
              id: asset.id,
              cid: result.id,
              jwe: JSON.stringify(jwe),
              syncDate: new Date(),
              syncStatus: SyncStatus.SYNCED,
            },
          ])
        } else {
          const result = await uploadAsset(asset)
          Assets.addOrUpdate([
            {
              id: asset.id,
              cid: result,
              syncDate: new Date(),
              syncStatus: SyncStatus.SYNCED,
            },
          ])
        }
        try {
          callback?.(true)
        } catch {}
      }
    } catch (error) {
      console.log("backgroundTask:", error)
      try {
        callback?.(false)
      } catch {}
    }
    await BackgroundJob.stop()
  })
}
/**
 * You need to make sure the box addresses are added and then call this method
 * @param options
 */
export const uploadAssetsInBackground = async (options: {
  callback?: (success: boolean) => void
}) => {
  try {
    const assets = (await Assets.getAllNeedToSync())?.toJSON()
    if (assets.length) {
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
    console.log("Error", e)
    await BackgroundJob.stop()
  }
}

export const uploadAsset = async (asset: AssetEntity) => {
  const _filePath = asset.uri?.split("file:")[1]
  return await file.send(decodeURI(_filePath))
}

export const encryptAndUploadAsset = async (asset: AssetEntity): Promise<file.FileRef> => {
  const _filePath = asset.uri?.split("file:")[1]
  return await file.encryptSend(decodeURI(_filePath))
}

export const downloadAsset = async (cid: string) => {
  return await file.receive(cid, false)
}
export const downloadAndDecryptAsset = async (fileRef: file.FileRef) => {
  return await file.receiveDecrypt(fileRef, false)
}
export const AddBoxs = async () => {
  try {
    const boxs = await Boxs.getAll()
    console.log("boxs:", boxs)
    if (boxs && boxs.length) {
      boxs.map(async (item) => {
        try {
          await fula.addBox(item.address)
        } catch (error) {
          console.log(error)
        }
      })
    } else {
      throw "There is no box, please first add a box in the box list!"
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

/// Configure BackgroundFetch.
///
export const initBackgroundFetch = async () => {
  return await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      // Android options
      forceAlarmManager: false, // <-- Set true to bypass JobScheduler.
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
      requiresCharging: false, // Default
      requiresDeviceIdle: false, // Default
      requiresBatteryNotLow: true, // Default
      requiresStorageNotLow: false, // Default
    },
    async (taskId: string) => {
      console.log("[BackgroundFetch (configure)] taskId", taskId)
      await backgroundFetchHeadlessTask({ taskId, timeout: false })

      BackgroundFetch.finish(taskId)
    },
    (taskId: string) => {
      // Oh No!  Our task took too long to complete and the OS has signalled
      // that this task must be finished immediately.
      console.log("[Fetch] TIMEOUT taskId:", taskId)
      BackgroundFetch.finish(taskId)
    },
  )
}

/// BackgroundFetch Android Headless Event Receiver.
/// Called when the Android app is terminated.
///
export const backgroundFetchHeadlessTask = async (event: HeadlessEvent) => {
  if (event.timeout) {
    console.log("[BackgroundFetch] 💀 HeadlessTask TIMEOUT: ", event.taskId)
    BackgroundFetch.finish(event.taskId)
    return
  }

  console.log("[BackgroundFetch] 💀 HeadlessTask start: ", event.taskId)
  await uploadAssetsInBackground()

  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  BackgroundFetch.finish(event.taskId)
}
