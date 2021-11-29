import {useRecoilState, useRecoilTransaction_UNSTABLE, useSetRecoilState} from "recoil";
import {mediasState} from "../states";
import {Asset, MediaType} from "expo-media-library";
import React, {useEffect} from "react";
import * as MediaLibrary from "expo-media-library";
import {MediaRepository} from "../repositories/MediaRepository";
import {storagePermission} from "../utils/permissions";
import {uploadListState} from "./Sync/SyncState";
import {Media} from "../types/interfaces";

const MediasManager = () => {
	type Action = { type: "insert" | "delete" | "refresh" | "loading", payload: Asset[] }
	const [medias,setMedias]=useRecoilState<Media[]>(mediasState)
	const setUploadList = useSetRecoilState(uploadListState)
	const mediaRepository = new MediaRepository();
	const mediaReducer = (action: Action) => {
		if (action.type === "loading") {
			(async () => {
				try{
					const gen = mediaRepository.getIterable()
					while (true){
						// @ts-ignore
						const {done,value} = await gen.next()
						if(done){
							break;
						}
						switch (value.type){
							case 'old':{
								setMedias((currVal) => [...currVal,...value.medias])
								setUploadList(value.medias.filter((x:Media)=>x.mediaType===MediaType.photo&&!x.hasCid))
								break;
							}
							case 'cache':{
								if(medias.length===0){
									setMedias(value.medias)
									setUploadList(value.medias.filter((x:Media)=>x.mediaType===MediaType.photo&&!x.hasCid))
								}
								break;
							}
							case 'new':{
								setMedias((currVal) => [...value.medias, ...currVal])
								setUploadList(value.medias.filter((x:Media)=>x.mediaType===MediaType.photo&&!x.hasCid))
								break;
							}
						}


					}
				}catch (e) {
					console.log(e.message)
				}
		
			})()
		}
	}
	useEffect(() => {
		storagePermission()
			// .then((res) => setPermission(res))
			.catch((error) => {
			});
		mediaReducer({type:"loading",payload:[]})
		MediaLibrary.addListener(event => {
			mediaReducer({type:"loading",payload:[]})
		})
		return () => {
			MediaLibrary.removeAllListeners()
			mediaRepository.close()}
	}, [])

	return (<></>)
}

export default MediasManager