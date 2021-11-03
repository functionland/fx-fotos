import {useRecoilState, useRecoilValue} from "recoil";
import React, {useContext, useEffect, useState} from "react";
import {BorgContext} from "@functionland/rn-borg/src/BorgClient";
import {mediasState} from "../states";
import {DeviceEventEmitter} from "react-native";
import {Media} from "../domian";


const Sync = () => {
	const [medias, setMedias] = useRecoilState(mediasState);
	let processFlag = false;
	let borgConnected = false;
	let borgReady = false;


	const borg = useContext(BorgContext)
	useEffect(() => {
		console.log(["rerendered Sync", processFlag])
	})
	useEffect(() => {
		let qu:Media[] = [];
		(async () => {
			setTimeout(async () => {
				// @ts-ignore
				borgReady = await borg.start();
				// @ts-ignore
				borgConnected = await borg.connect("QmemhZwyV9LhEv14qWYWdQqcYctQwxyBzutPUeU2DtYMgY")
			}, 100)
		})()
		DeviceEventEmitter.addListener("newdata", (data) => {
			qu = data;
		})
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
		return () => clearInterval(interval)
	}, [])

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

	useEffect(() => {
		DeviceEventEmitter.emit("newdata", medias.filter(media => !media.hasCid));
	}, [medias])

	return (<></>)
}

export default Sync