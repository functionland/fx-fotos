export const uploadFile = async(mediaAsset: Asset, index:number = 1) => {
    console.log('uploading index '+index);
    console.log(uploadingPercent.current[index]);
    uploadedAssets.current[mediaAsset.id] = 1;
    if(!uploadingPercent.current[index]){
        uploadingPercent.current[index] = new Animated.Value(1);
    }else{
        console.log('setting uploadingPercent value to 1 for '+index);
        uploadingPercent.current[index]?.setValue(1);
    }
    
    lastUpload.value = mediaAsset.id;
    if(mediaAsset){
        const mediaInfo = await getAssetInfoAsync(mediaAsset);
        if(typeof mediaInfo.localUri === 'string'){
            const fileBase64 = await FileSystem.readAsStringAsync(mediaInfo.localUri, {
                encoding: FileSystem.EncodingType.Base64,
          });
            let url = `data:${mime.lookup(mediaInfo.localUri)};base64,${fileBase64}`;
            var buff = Buffer.from(fileBase64, 'base64');
            const mediaFile:File = {
                lastModified: mediaInfo.modificationTime || mediaInfo.creationTime
                , name: mediaInfo.filename
                , size: buff.length
                , arrayBuffer: async()=>{return buff}
                , type: mediaInfo.mediaType
                , slice: (buff.slice as any)
                , stream: ():any=>{}
                , text: async()=>{ return '';}
            }
            const videoUploadController = await upload(mediaFile, '', mediaAsset.id);
            console.log('setting uploaded to true')
            uploadedAssets.current[mediaAsset.id] = 100;
            console.log(_videoUploadController.current.completedVideo);
            
        }
    }
}