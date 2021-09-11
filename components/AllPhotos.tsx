import React, {useEffect, useRef } from 'react';
import {Animated, View, Text, } from 'react-native';
import RenderPhotos from './RenderPhotos';
import SingleMedia from './SingleMedia';
import StoryHolder from './StoryHolder';
import ActionBar from './ActionBar';
import { Asset, getAssetInfoAsync  } from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useBackEndProviders } from '../backend';
import * as mime from 'react-native-mime-types';
import BottomSheet from '@gorhom/bottom-sheet';
import { ShareSheet, AlbumSheet } from './BottomSheets';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-root-toast';
import { useNavigation } from '@react-navigation/native';

import {
  useRecoilState,
} from 'recoil';
import {preparedMediaState, identityState, albumsState, } from '../states';

import { default as Reanimated, useSharedValue, useAnimatedReaction, runOnJS, } from 'react-native-reanimated';

interface Props {
  removeElements: Function;
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
  scrollY2: Reanimated.SharedValue<number>
  scrollY3: Reanimated.SharedValue<number>
  scrollY4: Reanimated.SharedValue<number>
  loading: boolean;
  focalX: Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  velocity: Animated.Value;
  storiesHeight: number;
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
  SCREEN_HEIGHT: number;
  SCREEN_WIDTH: number;
}

const AllPhotos: React.FC<Props> = (props) => {
	const navigation = useNavigation();
  const selectedAssets:Reanimated.SharedValue<string[]> = useSharedValue([]);
  // Since animated arrays are not natively supported and updates do not propagate, we need to ad
  // the two below natively supported numbers to detect changes in the array
  // and change them whenever selectedAssets change and useDerivedValue on those to detect changes
  const lastSelectedAssetId = useSharedValue('');
  const lastSelectedAssetAction = useSharedValue(0); //0:unselect, 1:select


	/**
	 * the below variable are to control uploaded assets
	 */
	 const uploadedAssets = useRef<{[key:string]:number}>({});
	 const lastUpload:Reanimated.SharedValue<string> = useSharedValue('');
	 const uploadingPercent = useRef<Array<Animated.Value>>([]);

  const [preparedMedia, setPreparedMedia] = useRecoilState(preparedMediaState);
	const [identity] = useRecoilState(identityState);
	const [albums, setAlbums] = useRecoilState(albumsState);

	// share bottom sheet ref
	const shareBottomSheetRef = useRef<BottomSheet>(null);
	const shareBottomSheetOpacity = useRef(new Animated.Value(0)).current;

	// album bottom sheet ref
	const albumBottomSheetRef = useRef<BottomSheet>(null);
	const albumBottomSheetOpacity = useRef(new Animated.Value(0)).current;
	

  useEffect(()=>{
    console.log([Date.now()+': component AllPhotos rendered']);
  });

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    console.log(['component AllPhotos mounted']);
    return () => {isMounted.current = false;console.log(['component AllPhotos unmounted']);}
  }, []);
 
  const showStory = useRef(new Animated.Value(0)).current;
  const scrollIndex2 = useRef(new Animated.Value(0)).current;
  const scrollIndex3 = useRef(new Animated.Value(0)).current;
  const scrollIndex4 = useRef(new Animated.Value(0)).current;
	const lastAlbumName = useRef<string>('');
	const ChangeLastAlbumName = (newAlbumName:string) => {
		lastAlbumName.current = newAlbumName;
	}


  const dragY = useSharedValue(0);
  const modalShown = useSharedValue(0);
  const animatedImagePositionX = useSharedValue(0);
  const animatedImagePositionY = useSharedValue(0);
  const animatedSingleMediaIndex = useSharedValue(-1);
  const singleImageWidth = useSharedValue(props.SCREEN_WIDTH);
  const singleImageHeight = useSharedValue(props.SCREEN_HEIGHT);
  const actionBarOpacity = useSharedValue(0);

  const selectedAssetsRef = useRef<string[]>([]);
  const _setSelectedValueRef = (selected:string[]) => {
    selectedAssetsRef.current = selected;
  }

  useAnimatedReaction(() => {
    return ([selectedAssets.value.length, lastSelectedAssetId.value, lastSelectedAssetAction.value]);
  }, (result, previous) => {
    if (result !== previous) {
      if(selectedAssets.value.length>0){
        props.headerShown.value = 0;
        actionBarOpacity.value = 1;
      }else{
        props.headerShown.value = 1;
        actionBarOpacity.value = 0;
      }
      runOnJS(_setSelectedValueRef)(selectedAssets.value);
    }
  }, [lastSelectedAssetId,lastSelectedAssetAction, modalShown]);


  const _goBack = () => {
    console.log('Went back');
    selectedAssets.value = [];
    lastSelectedAssetId.value = '';
    lastSelectedAssetAction.value = 0;
  }

  const _handleDelete = () => {
    console.log('Deleting');
    console.log(selectedAssetsRef.current);
    props.removeElements(selectedAssetsRef.current);
    _goBack();
  }

  const _handleShare = () => {
		console.log('Sharing');
		shareBottomSheetRef.current?.snapToIndex(1);
	}

  const _handleAddToAlbum = () => {
		console.log('Adding to Album');
		albumBottomSheetRef.current?.snapToIndex(1);
	}
	const addToAlbum = () => {
		preparedMedia.layout.map(
			async(x, index)=>{
				if(selectedAssetsRef.current.includes(x.id)){
					if(typeof x.value !== 'string'){
						let added = await addToAlbum_(x.id, lastAlbumName.current);
						console.log('added videos to album');
						console.log(added);
						setAlbums([...albums, {name: lastAlbumName.current}]);
						let toast = Toast.show('Added to Album', {
							duration: Toast.durations.SHORT,
						});
					}
				}
			}
		);
	}
	const {_userId, _videoUploadController, upload, getMedias, share, backendSettings, addMediaToAlbum, getAlbums} = useBackEndProviders({backend:'dfinity', identity: identity, requireProfile:true});

	const shareMedia = async(videoId:string, targetUserId:string) => {
		return await share(videoId, targetUserId);
	}
	const addToAlbum_ = async(videoId:string, albumName:string) => {
		return await addMediaToAlbum(albumName, videoId);
	}

	const createUploadedAssets = (backendResponse:Array<any> | undefined) => {
		console.log('createUploadedAssets');
		console.log(backendResponse);
		let res:{[key:string]:number} = {};
		if(backendResponse){
			for(let i=0; i<backendResponse.length; i++){
				if(backendResponse[i] && backendResponse[i].externalId){
					res[backendResponse[i].externalId] = 100;
				}
			}
		}
		return res;
	}
	useEffect(()=>{
		console.log('identity changed');
		console.log(identity);
		if(identity && identity[0]?.userId){
			getMedias().then((res)=>{
				/*res = [
					Object {
						"abuseFlagCount": 0n,
						"caption": "",
						"chunkCount": 22n,
						"createdAt": 1628017963470000n,
						"externalId": "2131A3EC-3715-48E7-A805-F0A5728E4814/L0/001",
						"likes": Array [],
						"name": "IMG_5627.MOV",
						"pic": Array [
							Array [],
						],
						"superLikes": Array [],
						"tags": Array [],
						"uploadedAt": 1628017992186192286n,
						"userId": "II://zfhab-gwmc5-stn3s-aet7i-iwczy-pougc-rqr72-36tal-ew46m-anrdh-tqe",
						"videoId": "II://zfhab-gwmc5-stn3s-aet7i-iwczy-pougc-rqr72-36tal-ew46m-anrdh-tqe-IMG_5627.MOV-1628017992186192286",
						"viewCount": 0n,
						"viewerHasFlagged": Array [],
						"viralAt": Array [],
					},
				]
				*/
				const backendMedias = createUploadedAssets(res);
				console.log(backendMedias);
				uploadedAssets.current = backendMedias;
				getAlbums().then((res)=>{
					console.log('get albums');
					console.log(res);
					if(res){
						setAlbums(res);
					}
				});
			});
		}
	}, [identity])
	
	const uploadFile = async(mediaAsset: Asset, index:number = 1) => {
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

	const shareWithContact = async(contactId:string = "") => {
		if(!contactId){
			console.log('sharing without a contact');
			navigation.navigate('BarcodeScanner');
		}
	}
	const shareLink = async() => {
		preparedMedia.layout.map(
			async(x, index)=>{
				if(selectedAssetsRef.current.includes(x.id)){
					if(typeof x.value !== 'string'){
						let link = await shareMedia(x.id, "");
						if(link){
							let fullURL = backendSettings?.networks?.uiLocal?.bind+link;
							Clipboard.setString(fullURL);
							let toast = Toast.show('Link is copied to clipboard', {
								duration: Toast.durations.LONG,
							});
						}
					}
				}
			}
		)
	}

  const _handleUpload = async() => {
		console.log('Uploading');
		console.log(selectedAssetsRef.current);
		preparedMedia.layout.map(
			(x, index)=>{
				if(selectedAssetsRef.current.includes(x.id)){
					if(typeof x.value !== 'string'){
						uploadFile(x.value, index);
					}
				}
			}
		)
	}
	
	const _handleMore = () => console.log('Shown more');


  
  return (
    preparedMedia.layout.length>0?(
    <View
      style={{
        flex: 1,
        width: props.SCREEN_WIDTH,
        position: 'relative',
      }}
    >
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={props.SCREEN_WIDTH*2}
        minWidth={props.SCREEN_WIDTH/2}
        numColumns={2}
        sortCondition="day"
        scale={props.scale}
        numColumnsAnimated={props.numColumnsAnimated}
        scrollIndex2={scrollIndex2}
        scrollIndex3={scrollIndex3}
        scrollIndex4={scrollIndex4}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
        modalShown={modalShown}
        headerShown={props.headerShown}
        storiesHeight={props.storiesHeight}
        scrollY={props.scrollY2}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        showStory={showStory}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        selectedAssets={selectedAssets}
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}

				uploadedAssets={uploadedAssets}
				lastUpload={lastUpload}
				uploadingPercent={uploadingPercent}

        dragY={dragY}
        SCREEN_HEIGHT={props.SCREEN_HEIGHT}
        SCREEN_WIDTH={props.SCREEN_WIDTH}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={props.SCREEN_WIDTH*2}
        minWidth={props.SCREEN_WIDTH/2}
        numColumns={3}
        sortCondition="day"
        numColumnsAnimated={props.numColumnsAnimated}
        scale={props.scale}
        scrollIndex2={scrollIndex2}
        scrollIndex3={scrollIndex3}
        scrollIndex4={scrollIndex4}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
        modalShown={modalShown}
        headerShown={props.headerShown}
        storiesHeight={props.storiesHeight}
        showStory={showStory}
        scrollY={props.scrollY3}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        selectedAssets={selectedAssets}
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
        dragY={dragY}
        SCREEN_HEIGHT={props.SCREEN_HEIGHT}
        SCREEN_WIDTH={props.SCREEN_WIDTH}

				uploadedAssets={uploadedAssets}
				lastUpload={lastUpload}
				uploadingPercent={uploadingPercent}
      />
      <RenderPhotos
        photos={preparedMedia}
        loading={props.loading}
        maxWidth={props.SCREEN_WIDTH*2}
        minWidth={props.SCREEN_WIDTH/2}
        numColumns={4}
        sortCondition="month"
        numColumnsAnimated={props.numColumnsAnimated}
        scale={props.scale}
        scrollIndex2={scrollIndex2}
        scrollIndex3={scrollIndex3}
        scrollIndex4={scrollIndex4}
        focalY={props.focalY}
        numberOfPointers={props.numberOfPointers}
        modalShown={modalShown}
        headerShown={props.headerShown}
        storiesHeight={props.storiesHeight}
        showStory={showStory}
        scrollY={props.scrollY4}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        selectedAssets={selectedAssets}
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
        dragY={dragY}
        SCREEN_HEIGHT={props.SCREEN_HEIGHT}
        SCREEN_WIDTH={props.SCREEN_WIDTH}

				uploadedAssets={uploadedAssets}
				lastUpload={lastUpload}
				uploadingPercent={uploadingPercent}
      />
      <SingleMedia 
        modalShown={modalShown}
        headerShown={props.headerShown}
        animatedImagePositionX={animatedImagePositionX}
        animatedImagePositionY={animatedImagePositionY}
        animatedSingleMediaIndex={animatedSingleMediaIndex}
        singleImageWidth={singleImageWidth}
        singleImageHeight={singleImageHeight}
        numColumnsAnimated={props.numColumnsAnimated}
      />
      <StoryHolder 
        duration={1500}
        showStory={showStory}
        headerShown={props.headerShown}
      />
      <ActionBar
        actionBarOpacity={actionBarOpacity}
        selectedAssets={selectedAssets}
        lastSelectedAssetId={lastSelectedAssetId}
        lastSelectedAssetAction={lastSelectedAssetAction}
        backAction={_goBack}
        actions={[
          {
            icon: "share-variant",
            onPress: _handleShare,
            color: "#007AFF",
            name: "share"
          },
          {
            icon: "plus",
            onPress: _handleAddToAlbum,
            color: "#007AFF",
            name: "add"
          },
          {
            icon: "trash-can-outline",
            onPress: _handleDelete,
            color: "#007AFF",
            name: "delete"
          },
          {
            icon: "upload-lock-outline",
            onPress: _handleUpload,
            color: "#007AFF",
            name: "upload"
          }
        ]}
        moreActions={[]}
      />
      <ShareSheet 
				bottomSheetRef={shareBottomSheetRef} 
				opacity={shareBottomSheetOpacity} 
				FOOTER_HEIGHT={props.FOOTER_HEIGHT}
				methods={{
					shareLink: shareLink,
					shareWithContact: shareWithContact,
				}}
			/>
			<AlbumSheet 
				bottomSheetRef={albumBottomSheetRef} 
				opacity={albumBottomSheetOpacity} 
				FOOTER_HEIGHT={props.FOOTER_HEIGHT}
				methods={{
					addToAlbum: addToAlbum,
					ChangeLastAlbumName: ChangeLastAlbumName,
				}}
			/>
    </View>
    ):(
      <View><Text>No Photos</Text></View>
    )
  );
};
const isEqual = (prevProps:Props, nextProps:Props) => {
  return (prevProps.storiesHeight === nextProps.storiesHeight && prevProps.removeElements === nextProps.removeElements);
}
export default React.memo(AllPhotos, isEqual);
