import type {Asset} from 'expo-media-library';
import {EventEmitter} from "react-native";

export interface IEntity {
	
}

export interface IService {
	
}

export interface Scan extends IService{
	indexer():void
}

export interface Sync extends IService{
	backup():EventEmitter
	restore():EventEmitter
}

export interface Media extends IEntity, Asset{
	hasCid:Boolean
	cid:string
}






