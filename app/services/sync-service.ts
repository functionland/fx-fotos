import { Platform } from "react-native"
import BackgroundJob, { BackgroundTaskOptions } from "react-native-background-actions"
import { file, fula } from "react-native-fula"
import { AssetEntity } from "../realmdb/entities"

import { SyncStatus } from "../types"
import { Assets, Boxs } from "./localdb/index"
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

const backgroundTask = async (taskParameters:TaskParams) => {
  if (Platform.OS === "ios") {
    console.warn(
      "This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,",
      "geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.",
    )
  }
  const { callback = null,assets=[] } = taskParameters
  await new Promise(async (resolve) => {
    try {
      // const assets = await (await Assets.getAllNeedToSync()).toJSON()
      console.log("syncAssets assets.length", assets.length, callback)

      for (let index = 0; index < assets.length; index++) {
        const asset = assets[index]
        BackgroundJob.updateNotification({
          taskTitle: `Upload asset #${index + 1}`,
          taskDesc: `Totla: ${assets.length}`,
          progressBar: {
            max: assets.length,
            value: index,
            indeterminate: assets.length == 1,
          },
        })
        const result = await uploadAsset(asset)
        Assets.addOrUpdate([
          {
            id: asset.id,
            cid: result,
            syncDate: new Date(),
            syncStatus: SyncStatus.SYNCED,
          },
        ])
        try {
          callback?.(true)
        } catch {}
        console.log("result:", result)
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

export const downloadAsset = async (cid: string) => {
  return await file.receive(cid, false)
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
