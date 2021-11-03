import {useRecoilState, useRecoilValue} from "recoil";
import React, {useContext, useEffect, useState} from "react";
import {BorgContext} from "@functionland/rn-borg/src/BorgClient";
import {mediasState} from "../states";
import {DeviceEventEmitter} from "react-native";
import {Media} from "../domian";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';


const Sync = () => {
	const [medias, setMedias] = useRecoilState(mediasState);
	const borg = useContext(BorgContext)

	useEffect(() => {
		console.log(["rerendered Sync"])
	})
	useEffect(() => {
		let processFlag = false;
		let borgConnected = false;
		let borgReady = false;
		let currentMedia: Media[] = []
		let qu: Media[] = [];
		(async () => {
			setTimeout(async () => {
				// @ts-ignore
				borgReady = await borg.start();
				// @ts-ignore
				borgConnected = await borg.connect("QmemhZwyV9LhEv14qWYWdQqcYctQwxyBzutPUeU2DtYMgY")
			}, 100)
		})()
		const interval = setInterval(() => {
			console.log("interval started")
			if (!processFlag && borgConnected && qu.length > 0) {
				processFlag = true
				console.log("uploading started")
				const pending = qu[0]
				try {
					(async () => {
						// @ts-ignore
						const cid = await borg.sendFile(pending.uri)
						DeviceEventEmitter.emit("uploadcomplete", {id: pending.id, cid: cid})
					})()
					console.log(pending)
					// @ts-ignore

				} catch (e) {
					console.log(e)
					processFlag = false
				}
			}
		}, 50000)
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
						throw Error(`cid : ${cid}, id: ${id}, index: ${index}, medias: ${medias}`)
						// return currVal
					}

				}))
				processFlag = false
			} else {
				throw Error(`cid : ${cid}, id: ${id}, medias: ${medias}`)
			}
		})

		DeviceEventEmitter.addListener("downloadStart", async (ids: string[]) => {
			console.log("download start")
			if (ids.length > 0) {
				for (const id of ids) {
					// console.log(id,currentMedia)
					const index = currentMedia.findIndex(media => media.id === id)
					if (index > -1) {
						// @ts-ignore
						const file = await borg.receiveFile(currentMedia[index].cid)
						// console.log(file)
						const base64Code = file.split(",")[1];
						console.log("file download shode")
						const fileUrl = FileSystem.documentDirectory + `/${currentMedia[index].filename}`
						await FileSystem.writeAsStringAsync(fileUrl, base64Code, {encoding: FileSystem.EncodingType.Base64})
						const asset = await MediaLibrary.createAssetAsync(fileUrl);
						setMedias((currVal) => {
							const assetIndex = currVal.findIndex(media => media.id === asset.id)
							if (assetIndex > -1) {
								return [...currVal.slice(0, index),
									{...currVal[assetIndex], cid: currentMedia[index].cid, hasCid: true},
									...currVal.slice(index + 1)
								].filter(media => media.id !== id)
							} else {
								return [...currVal.filter(media => media.id !== id), {
									...asset,
									cid: currentMedia[index].cid,
									hasCid: true
								}]

							}


						});

						console.log("file zakhireshode")
					} else {
						console.log("cant find index")
						throw Error(`file not found`)
						// return currVal
					}

				}
			}
		})
		DeviceEventEmitter.addListener("mediasChanged", (data) => {
			currentMedia = data;
		})
		DeviceEventEmitter.addListener("newdata", (data) => {
			qu = data;
		})

		return () => {
			clearInterval(interval);
			DeviceEventEmitter.removeAllListeners("mediasChanged")
			DeviceEventEmitter.removeAllListeners("newdata")
			DeviceEventEmitter.removeAllListeners("downloadStart")
		}
	}, [])
	useEffect(() => {
		DeviceEventEmitter.emit("newdata", medias.filter(media => !media.hasCid));
		DeviceEventEmitter.emit("mediasChanged", medias);
	}, [medias])

	return (<></>)
}

export default Sync