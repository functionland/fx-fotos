import React, {useEffect, useRef} from 'react';
import {Animated, View, Text,} from 'react-native';
import RenderPhotos from './RenderPhotos';
import SingleMedia from './SingleMedia';
import StoryHolder from './StoryHolder';
import ActionBar from './ActionBar';
import {Asset, getAssetInfoAsync} from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
// @ts-ignore
import * as mime from 'react-native-mime-types';
import BottomSheet from '@gorhom/bottom-sheet';
import {ShareSheet, AlbumSheet} from './BottomSheets';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-root-toast';
import {useNavigation} from '@react-navigation/native';
import {useRecoilState} from 'recoil';
import {preparedMediaState, identityState, albumsState,} from '../states';

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
	const navigation = useNavigation();
	const selectedAssets: Reanimated.SharedValue<string[]> = useSharedValue([]);
	// Since animated arrays are not natively supported and updates do not propagate, we need to ad
	// the two below natively supported numbers to detect changes in the array
	// and change them whenever selectedAssets change and useDerivedValue on those to detect changes
	const lastSelectedAssetId = useSharedValue('');
	const lastSelectedAssetAction = useSharedValue(0); //0:unselect, 1:select


	/**
	 * the below variable are to control uploaded assets
	 */
	const uploadedAssets = useRef<{ [key: string]: number }>({});
	const lastUpload: Reanimated.SharedValue<string> = useSharedValue('');
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


	useEffect(() => {
		console.log([Date.now() + ': component AllPhotos rendered']);
	});

	const isMounted = useRef(false);
	useEffect(() => {
		isMounted.current = true;
		console.log(['component AllPhotos mounted']);
		return () => {
			isMounted.current = false;
			console.log(['component AllPhotos unmounted']);
		}
	}, []);

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
		preparedMedia.layout.map(
			async (x, index) => {
				if (selectedAssetsRef.current.includes(x.id)) {
					if (typeof x.value !== 'string') {
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

	const shareMedia = async (videoId: string, targetUserId: string) => {
		console.log("not implemented")
	}
	const addToAlbum_ = async (videoId: string, albumName: string) => {
		console.log("not implemented")
	}

	useEffect(() => {

	}, [identity])

	const uploadFile = async (mediaAsset: Asset, index: number = 1) => {
		console.log("not implemented")
	}

	const shareWithContact = async (contactId: string = "") => {
		console.log("not implemented")
	}

	const shareLink = async () => {
		console.log("not implemented")
	}

	const _handleUpload = async () => {
		console.log("not implemented")
	}

	const _handleMore = () => console.log('Shown more');


	return (
		preparedMedia.layout.length > 0 ? (
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
					maxWidth={props.SCREEN_WIDTH * 2}
					minWidth={props.SCREEN_WIDTH / 2}
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
					maxWidth={props.SCREEN_WIDTH * 2}
					minWidth={props.SCREEN_WIDTH / 2}
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
		) : (
			<View><Text>No Photos</Text></View>
		)
	);
};
const isEqual = (prevProps: Props, nextProps: Props) => {
	return (prevProps.storiesHeight === nextProps.storiesHeight && prevProps.removeElements === nextProps.removeElements);
}
export default React.memo(AllPhotos, isEqual);
