//import { useUploadVideo } from "./dfinity/utils";
class BackEndProvidersClass {
	_userId:string = '';
	_videoUploadController:any = null;

	constructor(identity:any[] = []) {
		if(identity){
			this._userId = identity[0].provider + '://' +identity[0].userId;
		}
	}
	upload = async(mediaFile:File, caption:string='') => {
		console.log('upload userId='+this._userId);
		/*this._videoUploadController = useUploadVideo({
			userId: this._userId,
		});
		if (!mediaFile || !this._videoUploadController || !this._userId) {
			return undefined;
		}
		this._videoUploadController.setFile(mediaFile);
		this._videoUploadController.setCaption(caption);
		this._videoUploadController.setReady(true);
		return(this._videoUploadController);*/
	}
}

export default BackEndProvidersClass;