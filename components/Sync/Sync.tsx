import {useRecoilValue, useSetRecoilState} from "recoil";
import React, {useContext, useEffect} from "react";
import {BorgContext} from "@functionland/rn-borg/src/BorgClient";
import {mediasState} from "../../states";
import {SyncEngine} from "./SyncEngine";
import {uploadListState} from "./SyncState";


const Sync = () => {
	const needUploading = useRecoilValue(uploadListState);
	const setMedias = useSetRecoilState(mediasState);
	const borg = useContext(BorgContext)
	const onUploadComplete = ({id, cid}:{id:string,cid:string}) => {
		if (cid.length > 0) {
			console.log("how many")
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
	}
	const syncEngine = SyncEngine.getInstance(borg, onUploadComplete)
	useEffect(() => {
		syncEngine.start()
		return () => {
			syncEngine.end()
		}
	}, [])
	useEffect(() => {
		syncEngine.addMedias(needUploading)
	}, [needUploading])

	return (<></>)
}

export default Sync






