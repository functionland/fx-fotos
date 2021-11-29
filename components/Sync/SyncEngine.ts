import {Media} from "../../types/interfaces";


export class SyncEngine {
	static myInstance:SyncEngine;
	private borg: any;
	private uploadQueue: Media[];
	private pending: Media[];
	private safetyMap: Map<string, 'pending' | 'queue' | 'done'>
	private borgConnected: boolean;
	private borgReady: boolean;
	
	private uploadRunner:any;
	private readonly maxConcurrent:number;
	private onUploadComplete: Function;

	constructor(borg: any,onUploadComplete:Function) {
		this.borg = borg;
		this.uploadQueue = [];
		this.pending = []
		this.borgConnected = false;
		this.borgReady = false;
		this.safetyMap = new Map();
		this.maxConcurrent = 1;
		this.onUploadComplete = onUploadComplete
	}


	/**
	 * @returns {SyncEngine}
	 */
	static getInstance(borg:any,onUploadComplete:Function) {
		if (!SyncEngine.myInstance) {
			SyncEngine.myInstance = new SyncEngine(borg,onUploadComplete);
		}

		return this.myInstance;
	}
	
	end(){
		clearInterval(this.uploadRunner)
	}
	
	start(){
		this.uploadRunner = setInterval(() => {
			console.log("interval started")
			if (this.borgConnected && this.uploadQueue.length > 0 && this.maxConcurrent>=this.pending.length) {
				console.log("uploading started")
				const pending = this._queueUploadMedia()
				try {
					(async () => {
						// @ts-ignore
						const cid = await this.borg.sendFile(pending.uri)
						// @ts-ignore
						this._finishUploadMedia(pending,cid)
					})()
					// @ts-ignore

				} catch (e) {
					console.log(e)
					// @ts-ignore
					this._failedUploadMedia(pending)
				}
			}
		}, 10000);
		(async () => {
			setTimeout(async () => {
				// @ts-ignore
				this.borgReady = await this.borg.start();
				// @ts-ignore
				this.borgConnected = await this.borg.connect("QmemhZwyV9LhEv14qWYWdQqcYctQwxyBzutPUeU2DtYMgY")
			}, 100)
		})()
	}

	addMedias(medias: Media[]) {
		for (const media of medias) {
			if (!this.safetyMap.has(media.id)) {
				this.uploadQueue.push(media)
				this.safetyMap.set(media.id, "queue")
			}
		}
	}

	_queueUploadMedia() {
		const media = this.uploadQueue.pop()
		if (!media) {
			return media
		}
		this.pending.push(media)
		this.safetyMap.set(media.id, "pending")
		return media
	}

	_finishUploadMedia(media: Media, cid: string) {
		this.pending = this.pending.filter(x => x.id !== media.id)
		this.safetyMap.set(media.id, "done")
		this.onUploadComplete( {id: media.id, cid: cid})
	}

	_failedUploadMedia(media: Media) {
		this.pending = this.pending.filter(x => x.id !== media.id)
		this.uploadQueue.push(media)
		this.safetyMap.set(media.id, "queue")
	}

}