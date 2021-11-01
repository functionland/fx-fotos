import type {Asset} from 'expo-media-library';

export interface IEntity {
	
}

export interface IService {
	
}

export interface Scan extends IService{
	indexer():void
}

export interface Sync extends IService{
	backup():void
	restore():void
}

export interface Media extends IEntity, Asset{
	hasCid:Boolean
	cid:string
}





