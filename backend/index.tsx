import { useRef } from 'react';
import { 
	useUploadVideo, 
	checkUsername,
	getUserVideos,
	createUser,
	shareMedia,
} from "./dfinity/utils";
import backendSettings from './dfinity/dfx.json';

export function useBackEndProviders(input:{backend:string, identity:any[], requireProfile?:Boolean}){
	const _userId = useRef<string>('');
	const _identity = useRef<any>();
	const _videoUploadController = useRef<any>();
	const _requireProfile = useRef<Boolean>(false);
	const profileChecked = useRef<Boolean>(true);
	if(input?.requireProfile){
		_requireProfile.current = true;
		profileChecked.current = false;
	}
	
	if(input?.identity?.length){
		if(_userId.current !== input.identity[0].provider + '://' +input.identity[0].userId){
			_userId.current = input.identity[0].provider + '://' +input.identity[0].userId;
			_identity.current = input.identity[0]?.identity;
		}
	}
	_videoUploadController.current = useUploadVideo({
		userId: _userId.current,
	});
	const checkProfile = async() => {
		console.log('checking profile requirement');
		if(_requireProfile.current){
			console.log('This backend requires a profile to use');
			if(_identity.current){
				const user = await createUser(_userId.current, _identity.current);
				profileChecked.current = true;
				console.log(user);
			}
		}else{
			profileChecked.current = true;
		}
		return Promise.resolve(profileChecked.current);
	}
	const getMedias = async(identity:any = undefined) => {
		if(identity){
			_userId.current = identity.provider + '://' +identity.userId;
			_identity.current = identity.identity;
		}
		console.log('getMedias for userId='+_userId.current);
		if(_requireProfile.current){
			let profileCheckSuccess = await checkProfile();
			if(!profileCheckSuccess){
				console.log('profile check failed');
				return undefined;
			}
		}

		return getUserVideos(_userId.current);

	}
	const share = async(videoId:string, targetUserId:string) => {
		console.log('sharing from userId='+_userId.current);
		if(_requireProfile.current){
			let profileCheckSuccess = await checkProfile();
			if(!profileCheckSuccess){
				console.log('profile check failed');
				return undefined;
			}
		}
		console.log('profileCheckSuccess videoId='+videoId+',targetUserId='+targetUserId);
		return shareMedia(videoId, targetUserId);
	}
	const upload = async(mediaFile:File, caption:string='', id:string='') => {
		console.log('upload userId='+_userId.current);
		if(_requireProfile.current){
			let profileCheckSuccess = await checkProfile();
			if(!profileCheckSuccess){
				console.log('profile check failed');
				return undefined;
			}
		}

		if (!mediaFile || !_videoUploadController.current || !_userId.current) {
			return undefined;
		}
		_videoUploadController.current.setFile(mediaFile);
		_videoUploadController.current.setCaption(caption);
		_videoUploadController.current.setId(id);
		_videoUploadController.current.setReady(true);
		return(_videoUploadController.current);
	}
	return {
		_userId,
		_videoUploadController,
		upload,
		getMedias,
		share,
		backendSettings
	  };
}