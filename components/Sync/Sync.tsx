import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import React, {useContext, useEffect, useState} from "react";
import {BorgContext} from "@functionland/rn-borg/src/BorgClient";
import {mediasState} from "../../states";
import {SyncEngine} from "./SyncEngine";
import {uploadListState} from "../../states/sync";
import {DeviceEventEmitter} from "react-native";
import {Media} from "../../domian";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';


const Sync = () => {
	const needUploading = useRecoilValue(uploadListState);
	const setMedias = useSetRecoilState(mediasState);
	const borg = useContext(BorgContext)
	const [syncEngine] = useState(new SyncEngine(borg))
	useEffect(() => {
		syncEngine.start()
		return () => {
			syncEngine.end()
		}
	}, [])
	useEffect(() => {
		syncEngine.addMedias(needUploading)
	}, [needUploading])
	DeviceEventEmitter.addListener("uploadcomplete", ({id, cid}) => {
		if (cid.length > 0) {
			setMedias((currVal => {
				const index = currVal.findIndex(media => media.id === id)
				if (index > -1) {
					return [...currVal.slice(0, index), {
						...currVal[index],
						cid,
						hasCid: true
					}, ...currVal.slice(index + 1)];
				} else {
					console.log("cant find index")
					throw Error(`cid : ${cid}, id: ${id}, index: ${index}, medias:`)
					// return currVal
				}

			}))
		} else {
			throw Error(`cid : ${cid}, id: ${id}`)
		}
	})
	DeviceEventEmitter.addListener("downloadStart", async (medias: Media[]) => {
		console.log("download start")
		if (medias.length > 0) {
			for (const media of medias) {
				// @ts-ignore
				const file = await borg.receiveFile(media.cid)
				const base64Code = file.split(",")[1];
				console.log("file download shode")
				const fileUrl = FileSystem.documentDirectory + `/${media.filename}`
				await FileSystem.writeAsStringAsync(fileUrl, base64Code, {encoding: FileSystem.EncodingType.Base64})
				const asset = await MediaLibrary.createAssetAsync(fileUrl);
				setMedias((currVal) => {
					const assetIndex = currVal.findIndex(media => media.id === asset.id)
					if (assetIndex > -1) {
						return [
							...currVal.slice(0, assetIndex),
							{...currVal[assetIndex], cid: media.cid, hasCid: true, preview: ''},
							...currVal.slice(assetIndex + 1)
						].filter(x => x.id !== media.id)
					} else {
						return [...currVal.filter(x => x.id !== media.id), {
							...asset,
							cid: media.cid,
							hasCid: true,
							preview: ''
						}]

					}


				});
			}

		}
	})


	return (<></>)
}

export default Sync






