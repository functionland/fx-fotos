import React, {useContext, useEffect, useRef} from 'react';
import {Animated, View, Text, AsyncStorage, DeviceEventEmitter,} from 'react-native';
import * as Clipboard from 'expo-clipboard';
// @ts-ignore
import * as mime from 'react-native-mime-types';
import BottomSheet from '@gorhom/bottom-sheet';
import {Asset, getAssetInfoAsync} from 'expo-media-library';
import {useRecoilState} from 'recoil';
import Toast from 'react-native-root-toast';
import {BorgContext} from '@functionland/rn-borg/src/BorgClient';
import RenderPhotos from './RenderPhotos';
import SingleMedia from './SingleMedia';
import StoryHolder from './StoryHolder';
import ActionBar from './ActionBar';
import {ShareSheet, AlbumSheet} from './BottomSheets';
import {layoutState} from '../states/photos';
import {default as Reanimated, useSharedValue, useAnimatedReaction, runOnJS,} from 'react-native-reanimated';


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
	const selectedAssets: Reanimated.SharedValue<string[]> = useSharedValue([]);
	const borg = useContext(BorgContext)
	const [layouts] = useRecoilState(layoutState)
	// Since animated arrays are not natively supported and updates do not propagate, we need to ad
	// the two below natively supported numbers to detect changes in the array
	// and change them whenever selectedAssets change and useDerivedValue on those to detect changes
	const lastSelectedAssetId = useSharedValue('');
	const lastSelectedAssetAction = useSharedValue(0); //0:unselect, 1:select


	// share bottom sheet ref
	const shareBottomSheetRef = useRef<BottomSheet>(null);
	const shareBottomSheetOpacity = useRef(new Animated.Value(0)).current;

	// album bottom sheet ref
	const albumBottomSheetRef = useRef<BottomSheet>(null);
	const albumBottomSheetOpacity = useRef(new Animated.Value(0)).current;


	useEffect(() => {
		console.log([Date.now() + ': component AllPhotos rendered']);
	});


	const showStory = useRef(new Animated.Value(0)).current;
	const scrollIndex2 = useRef(new Animated.Value(0)).current;
	const scrollIndex3 = useRef(new Animated.Value(0)).current;
	const scrollIndex4 = useRef(new Animated.Value(0)).current;
	const lastAlbumName = useRef<string>('');
	const ChangeLastAlbumName = (newAlbumName: string) => {
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
	const _setSelectedValueRef = (selected: string[]) => {
		selectedAssetsRef.current = selected;
	}

	useAnimatedReaction(() => {
		return ([selectedAssets.value.length, lastSelectedAssetId.value, lastSelectedAssetAction.value]);
	}, (result, previous) => {
		if (result !== previous) {
			if (selectedAssets.value.length > 0) {
				props.headerShown.value = 0;
				actionBarOpacity.value = 1;
			} else {
				props.headerShown.value = 1;
				actionBarOpacity.value = 0;
			}
			runOnJS(_setSelectedValueRef)(selectedAssets.value);
		}
	}, [lastSelectedAssetId, lastSelectedAssetAction, modalShown]);


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
		console.log('Not Implemented');
	}

	const shareMedia = async (videoId: string, targetUserId: string) => {
		console.log('Not Implemented');
	}
	const addToAlbum_ = async (videoId: string, albumName: string) => {
		console.log('Not Implemented');
	}


	const uploadFile = async (mediaAsset: Asset, index: number = 1) => {
		if (mediaAsset) {
			const mediaInfo = await getAssetInfoAsync(mediaAsset);
			if (typeof mediaInfo.localUri === 'string') {
				console.log("started")
				// @ts-ignore
				const videoUploadController = await borg.sendFile(mediaInfo.localUri);
				console.log('setting uploaded to true')
				await addUploadedFiles(mediaInfo.id)
			}
		}
	}

	const shareWithContact = async (contactId: string = "") => {
		if (!contactId) {
			console.log('sharing without a contact');
			console.log('Not Implemented');
		}
	}
	const shareLink = async () => {
		layouts.map((x, index) => {
				if (selectedAssetsRef.current.includes(x.id)) {
					if (typeof x.value !== 'string') {
						if (x.value.cid) {
							let fullURL = x.value.cid;
							Clipboard.setString(fullURL);
							console.log(fullURL)
							let toast = Toast.show('Link is copied to clipboard', {
								duration: Toast.durations.LONG,
							});
						}
					}
				}
			}
		)
	}

	const _handleUpload = async () => {
		console.log('Uploading');
		console.log(selectedAssetsRef.current);
		DeviceEventEmitter.emit("downloadStart", selectedAssetsRef.current)
	}

	const _handleMore = () => console.log('Shown more');

	const addUploadedFiles = async (assetId: string) => {
		try {
			const uploadedFileStr = await AsyncStorage.getItem('uploaded')
			await AsyncStorage.setItem('uploaded', JSON.stringify([...(uploadedFileStr != null ? JSON.parse(uploadedFileStr) : []), assetId]))
			console.log("upload ended")
		} catch (e) {
			console.log(e)
		}
	}

	return (
		layouts.length > 0 ? (
			<View
				style={{
					flex: 1,
					width: props.SCREEN_WIDTH,
					position: 'relative',
				}}
			>
				<RenderPhotos
					loading={props.loading}
					maxWidth={props.SCREEN_WIDTH * 2}
					minWidth={props.SCREEN_WIDTH / 2}
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
					dragY={dragY}
					SCREEN_HEIGHT={props.SCREEN_HEIGHT}
					SCREEN_WIDTH={props.SCREEN_WIDTH}
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
							icon: "download-lock-outline",
							onPress: _handleUpload,
							color: "#007AFF",
							name: "download"
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
		) : (
			<View><Text>No Photos</Text></View>
		)
	);
};
const isEqual = (prevProps: Props, nextProps: Props) => {
	return (prevProps.storiesHeight === nextProps.storiesHeight && prevProps.removeElements === nextProps.removeElements);
}
export default React.memo(AllPhotos, isEqual);
