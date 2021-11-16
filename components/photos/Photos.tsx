// import React, {useContext, useEffect, useRef, useState} from 'react';
// import {
// 	Animated,
// 	AsyncStorage,
// 	DeviceEventEmitter,
// 	FlatList,
// 	SafeAreaView,
// 	StatusBar,
// 	Text,
// 	useWindowDimensions,
// 	View
// } from 'react-native';
// import {
// 	default as Reanimated, interpolate,
// 	runOnJS, scrollTo as reanimatedScrollTo,
// 	useAnimatedReaction,
// 	useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue,
// 	useSharedValue, withDelay, withTiming,
// } from 'react-native-reanimated';
// import BottomSheet from "@gorhom/bottom-sheet";
// import * as Clipboard from "expo-clipboard";
// import Toast from "react-native-root-toast";
// import {useBackHandler} from "@react-native-community/hooks";
//
// import {useRecoilState, useRecoilTransaction_UNSTABLE, useRecoilValue} from "recoil";
// import {
// 	headerIndexesState,
// 	lastTimestampState,
// 	layoutState,
// 	numColumnsState,
// 	sortConditionState,
// 	storiesState
// } from "../../states/photos";
// import {
// 	mediasState
// } from "../../states";
//
// import {baseStyles} from "./Theme"
// import {ScrollContext} from "../Shared/ScrollContext";
// import PinchZoom from "./PinchZoom"
// import SingleMedia from "./SingleMedia";
// import StoryHolder from "./StoryHolder";
// import ActionBar from "../../components/ActionBar";
// // import {AlbumSheet, ShareSheet} from "../../components/BottomSheets";
// import {BaseScrollView, DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
// import {layout, story} from "../../types/interfaces";
// import Highlights from "./Highlights";
// import PhotosChunk from "./PhotosChunk";
// import {timestampToDate} from "../../utils/functions";
// import ThumbScroll from "../../components/ThumbScroll";
// import FloatingFilters from "../../components/FloatingFilters";
// import {LayoutUtil} from "../../utils/LayoutUtil";
// import {ExternalScrollView} from "./Shared/ExternalScroll";
// import {HeaderVisibilityState} from "../../states/layout";
// import {Media} from "../../domian";
// import {flatListFactory} from "../../utils/factories";
// import FastImage from "react-native-fast-image";
//
// interface Props {
// 	HEADER_HEIGHT: number;
// 	FOOTER_HEIGHT: number;
// }
//
// const Photos: React.FC<Props> = (props) => {
//
// 	const medias = useRecoilValue(mediasState)
//
// 	const loadGallery = useRecoilTransaction_UNSTABLE(({get, set}) =>
// 		(medias: Media[],
// 		 sortConditions: Array<'day' | 'month'>,
// 		 lastTimestampInput: number = 0,
// 		 lastIndex: number) => {
// 			const {
// 				lastTimestamp,
// 				layout,
// 				headerIndexes,
// 				stories
// 			} = flatListFactory(medias, sortConditions, lastTimestampInput, lastIndex)
// 			set(storiesState, stories)
// 			set(headerIndexesState, headerIndexes)
// 			set(layoutState, layout)
// 			set(lastTimestampState, lastTimestamp)
// 		})
//
// 	useEffect(() => {
// 		console.log("whay u dont render")
// 		if (medias?.length) {
// 			loadGallery(medias, ['day', 'month'], 0, 0)
// 			FastImage.preload(medias.map((media)=>{return {uri:media.preview ? media.preview : media.uri}}))
// 		}
// 	}, [medias]);
//
// 	const scale = useSharedValue(1);
// 	const numColumnsAnimated = useSharedValue(2)
// 	const [headerVisibility, setHeaderVisibility] = useRecoilState(HeaderVisibilityState)
// 	const {scrollY, scrollYAnimated} = useContext(ScrollContext)
// 	const stories = useRecoilValue(storiesState);
// 	const layouts = useRecoilValue(layoutState);
// 	const headerIndexes = useRecoilValue(headerIndexesState)
// 	const sortCondition = useRecoilValue(sortConditionState)
// 	const numColumns = useRecoilValue(numColumnsState)
// 	const {height, width} = useWindowDimensions();
// 	const headerHeight = 20;
// 	const indicatorHeight = 50;
// 	const selectedAssets: Reanimated.SharedValue<string[]> = useSharedValue([]);
// 	const showStory = useRef(new Animated.Value(0)).current;
//
// 	const lastAlbumName = useRef<string>('');
// 	const ChangeLastAlbumName = (newAlbumName: string) => {
// 		lastAlbumName.current = newAlbumName;
// 	}
//
// 	const storiesHeight: number = 1.618 * width / 3;
// 	const dragY = useSharedValue(0);
// 	const modalShown = useSharedValue(0);
// 	const animatedImagePositionX = useSharedValue(0);
// 	const animatedImagePositionY = useSharedValue(0);
// 	const animatedSingleMediaIndex = useSharedValue(-1);
// 	const singleImageWidth = useSharedValue(width);
// 	const singleImageHeight = useSharedValue(height);
// 	connumColumnsst actionBarOpacity = useSharedValue(0);
//
//
// 	// Since animated arrays are not natively supported and updates do not propagate, we need to ad
// 	// the two below natively supported numbers to detect changes in the array
// 	// and change them whenever selectedAssets change and useDerivedValue on those to detect changes
// 	const lastSelectedAssetId = useSharedValue('');
// 	const lastSelectedAssetAction = useSharedValue(0); //0:unselect, 1:select
//
//
// 	// share bottom sheet ref
// 	const shareBottomSheetRef = useRef<BottomSheet>(null);
// 	const shareBottomSheetOpacity = useSharedValue(0);
//
// 	// album bottom sheet ref
// 	const albumBottomSheetRef = useRef<BottomSheet>(null);
// 	const albumBottomSheetOpacity = useSharedValue(0);
//
// 	const [layoutProvider, setLayoutProvider] = useState<LayoutProvider>(new LayoutProvider((index)=>{return 'ok'},()=>{}));
//
// 	const [dataProvider, setDataProvider] = useState<DataProvider>(() => {
// 		return new DataProvider((r1, r2) => {
// 			return r1.uid !== r2.uid
// 		})
// 	})
//
// 	/****
// 	 * The below lines are to update the selection checkbox status in each media
// 	 */
// 	const clearSelection = useRef(new Animated.Value(0)).current;
// 	const selectedAssetsRef = useRef<string[]>([]);
// 	const setSelectedAssetsRef = (selected: string[]) => {
// 		selectedAssetsRef.current = selected;
// 	}
// 	const setClearSelection = (clear: number) => {
// 		clearSelection.setValue(clear);
// 	}
// 	const scrollRef: any = useRef();
// 	const scrollRefExternal = useAnimatedRef<Reanimated.ScrollView>();
// 	const showThumbScroll = useSharedValue(0);
// 	const showFloatingFilters = useSharedValue(0);
//
// 	const animatedTimeStampString = useSharedValue('');
//
// 	const layoutHeightAnimated = useSharedValue(99999999);
//
// 	const animatedStyle = useAnimatedStyle(() => {
// 		const _scale = interpolate(
// 			scale.value,
// 			[0, 1, 4],
// 			[numColumnsAnimated.value / (numColumnsAnimated.value + 1), 1, (numColumnsAnimated.value) / (numColumnsAnimated.value - 1)]
// 		);
//
// 		return {
// 			opacity: (interpolate(
// 				scale.value,
// 				[0, 1, 4],
// 				[0, 1, 0]
// 			)),
// 			zIndex: 1,
// 			transform: [
// 				{
// 					scale: _scale,
// 				},
// 				{
// 					translateX: (((_scale * width) - width) / (2 * _scale))
// 				},
// 				{
// 					translateY: (
// 						(
// 							(_scale * (width - (StatusBar.currentHeight || 0))) - (width - (StatusBar.currentHeight || 0))
// 						)
// 						/ (2 * _scale))
// 				}
// 			],
// 		};
// 	});
//
// 	/****
// 	 * The below lines are to update the scroll position across all modes
// 	 */
// 	useEffect(() => {
// 		console.log(['component Photos mounted ' + numColumns]);
//
// 		// scrollY.addListener(({value}) => {
// 		// 	scrollRef?.current?.scrollToIndex(value, false);
// 		// })
// 		//
// 		// return () => {
// 		// 	console.log(['component RenderPhotos unmounted']);
// 		// 	scrollY.removeAllListeners()
// 		// }
// 	}, []);
//
// 	useEffect(() => {
// 		setDataProvider(dataProvider.cloneWithRows(layouts));
// 		setLayoutProvider( new LayoutProvider(
// 			(index) => {
//
// 				return index === 0 ? 'story' : 'image'; //Since we have just one view type
// 			},
// 			(type, dim, index) => {
// 				const data =layouts[index]
// 				const windowWidth = LayoutUtil.getWindowWidth();
// 				if (type === 'story') {
// 					dim.width = windowWidth;
// 					dim.height = storiesHeight + 20 + 1 * headerHeight;
// 				} else {
// 					//let isHeader = headerIndexes.findIndex(x=>x.index===index && x.sortCondition===groupBy);
// 					let isHeader: boolean =
// 						typeof data?.value === 'string';
// 					if (isHeader) {
// 						dim.width = windowWidth;
// 						dim.height = headerHeight;
// 					} else {
// 						dim.width = windowWidth / numColumns - 10;
// 						dim.height = windowWidth / numColumns;
// 					}
// 				}
//
// 			},
// 		))
//		
//
// 	}, [layouts])
//	
// 	useEffect(()=>{
// 		setLayoutProvider( new LayoutProvider(
// 			(index) => {
//
// 				return index === 0 ? 'story' : 'image'; //Since we have just one view type
// 			},
// 			(type, dim, index) => {
// 				const data =layouts[index]
// 				const windowWidth = LayoutUtil.getWindowWidth();
// 				if (type === 'story') {
// 					dim.width = windowWidth;
// 					dim.height = storiesHeight + 20 + 1 * headerHeight;
// 				} else {
// 					//let isHeader = headerIndexes.findIndex(x=>x.index===index && x.sortCondition===groupBy);
// 					let isHeader: boolean =
// 						typeof data.value === 'string';
// 					if (isHeader) {
// 						dim.width = windowWidth;
// 						dim.height = headerHeight;
// 					} else {
// 						dim.width = windowWidth / numColumns - 10;
// 						dim.height = windowWidth / numColumns;
// 					}
// 				}
//
// 			},
// 		))
// 	},[numColumns])
//
//
// 	useDerivedValue(() => {
// 		//we need to add a dummy condition on the props.lastSelectedAssetAction.value and props.lastSelectedAssetIndex.value so that useDerivedValue does not ignore updating
// 		if (lastSelectedAssetAction.value > -1 && lastSelectedAssetId.value !== 'Thisisjustadummytext') {
// 			runOnJS(setSelectedAssetsRef)(selectedAssets.value);
// 			if (selectedAssets.value.length) {
// 				runOnJS(setClearSelection)(1);
// 			} else {
// 				console.log('erasing selection');
// 				runOnJS(setClearSelection)(0);
// 			}
// 			//selectedAssetsRef.current = props.selectedAssets.value;
// 		}
//
// 	}, [lastSelectedAssetAction, lastSelectedAssetId]);
//
// 	// useDerivedValue(() => {
// 	// 	reanimatedScrollTo(scrollRefExternal, 0, dragY.value, false);
// 	// }, [dragY]);
//
//
// 	useAnimatedReaction(() => {
// 		return ([selectedAssets.value.length, lastSelectedAssetId.value, lastSelectedAssetAction.value]);
// 	}, (result, previous) => {
// 		if (result !== previous) {
// 			if (selectedAssets.value.length > 0) {
// 				runOnJS(setHeaderVisibility)(false);
// 				actionBarOpacity.value = 1;
// 			} else {
// 				runOnJS(setHeaderVisibility)(true);
// 				actionBarOpacity.value = 0;
// 			}
// 		}
// 	}, [lastSelectedAssetId, lastSelectedAssetAction, modalShown]);
//
// 	const scrollHandlerReanimated = useAnimatedScrollHandler({
// 		onScroll: (e) => {
// 			console.log("error here")
// 			//position.value = e.contentOffset.x;
// 			scrollYAnimated.value = e.contentOffset.y;
// 			layoutHeightAnimated.value = e.contentSize.height;
// 			showThumbScroll.value = 1;
// 		},
// 		onEndDrag: (e) => {
// 			console.log('onEndDrag');
// 		},
// 		onMomentumEnd: (e) => {
// 			runOnJS(() => {
// 				console.log("error here")
// 				let currentTimeStamp = 0;
// 				let lastIndex = (scrollRef?.current?.findApproxFirstVisibleIndex() || 0);
// 				console.log(lastIndex)
// 				let currentImage = layouts[lastIndex].value;
//
// 				if (typeof currentImage === 'string') {
// 					currentImage = layouts[lastIndex + 1]?.value;
// 					if (currentImage && typeof currentImage === 'string') {
// 						currentImage = layouts[lastIndex + 2]?.value;
// 					}
// 				}
// 				if (currentImage && typeof currentImage !== 'string') {
// 					currentTimeStamp = currentImage.modificationTime;
// 				}
// 				let currentTimeStampString = timestampToDate(currentTimeStamp, ['month']).month;
// 				animatedTimeStampString.value = currentTimeStampString;
// 				scrollY.setValue(lastIndex)
// 				showThumbScroll.value = withDelay(3000, withTiming(0));
// 			})();
// 			//let lastIndex = scrollRef?.current?.findApproxFirstVisibleIndex();
// 		},
// 	});
//
//
// 	useBackHandler(() => {
// 		return false
// 	})
//
// 	const rowRenderer =(type: string | number, data: layout, index: number) => {
// 		if (data.sortCondition !== '' && data.sortCondition !== sortCondition) {
// 			return (<></>)
// 		}
// 		switch (type) {
// 			case 'story':
// 				return (
// 					<SafeAreaView style={{position: 'relative', zIndex: 1, marginTop: props.HEADER_HEIGHT}}>
// 						<FlatList
// 							data={stories}
// 							horizontal={true}
// 							keyExtractor={(item: story, index: number) => 'StoryItem_' + index + '_' + item.text}
// 							getItemLayout={(data, index) => {
// 								return {
// 									length: 15 + storiesHeight / 1.618,
// 									offset: index * (15 + storiesHeight / 1.618),
// 									index: index
// 								}
// 							}}
// 							showsHorizontalScrollIndicator={false}
// 							renderItem={({item}) => (
// 								<View
// 									style={{
// 										width: 15 + storiesHeight / 1.618,
// 										height: storiesHeight + 25,
// 									}}>
// 									<Highlights
// 										story={item}
// 										duration={1500}
// 										numColumns={numColumns}
// 										height={storiesHeight}
// 										showStory={showStory}
// 										setHeaderVisibility={setHeaderVisibility}
// 									/>
// 								</View>
// 							)}
// 						/>
// 					</SafeAreaView>
// 				);
// 			default:
// 				// props.uploadingPercent.current[index] = new Animated.Value(0);
// 				return (
//
// 						<PhotosChunk
// 							photo={data}
// 							index={data.index}
// 							setHeaderVisibility={setHeaderVisibility}
// 							modalShown={modalShown}
// 							headerHeight={headerHeight}
// 							selectedAssets={selectedAssets}
// 							lastSelectedAssetId={lastSelectedAssetId}
// 							lastSelectedAssetAction={lastSelectedAssetAction}
// 							selectedAssetsRef={selectedAssetsRef}
// 							clearSelection={clearSelection}
// 							animatedImagePositionX={animatedImagePositionX}
// 							animatedImagePositionY={animatedImagePositionY}
// 							animatedSingleMediaIndex={animatedSingleMediaIndex}
// 							singleImageWidth={singleImageWidth}
// 							singleImageHeight={singleImageHeight}
// 							imageWidth={(typeof data.value !== 'string') ? data.value.width : 0}
// 							imageHeight={(typeof data.value !== 'string') ? data.value.height : 0}
// 						/>
//
//
// 				);
// 		}
// 	};
//
//
// 	// const itemAnimator = new ItemAnimator({uploadingPercent: props.uploadingPercent});
//
//
// 	const _goBack = () => {
// 		console.log('Went back');
// 		selectedAssets.value = [];
// 		lastSelectedAssetId.value = '';
// 		lastSelectedAssetAction.value = 0;
// 	}
//
// 	const _handleDelete = () => {
// 		console.log('Deleting');
// 		console.log(selectedAssetsRef.current);
// 		// removeElements(selectedAssetsRef.current);
// 		_goBack();
// 	}
//
// 	const _handleShare = () => {
// 		console.log('Sharing');
// 		shareBottomSheetRef.current?.snapToIndex(1);
// 	}
//
// 	const _handleAddToAlbum = () => {
// 		console.log('Adding to Album');
// 		albumBottomSheetRef.current?.snapToIndex(1);
// 	}
// 	const addToAlbum = () => {
// 		console.log('Not Implemented');
// 	}
//
// 	const addToAlbum_ = async (videoId: string, albumName: string) => {
// 		console.log('Not Implemented');
// 	}
//
//
// 	const shareWithContact = async (contactId: string = "") => {
// 		if (!contactId) {
// 			console.log('sharing without a contact');
// 			console.log('Not Implemented');
// 		}
// 	}
// 	const shareLink = () => {
// 		let images = layouts
// 			.map(x => selectedAssetsRef.current.includes(x.id) && typeof x.value !== 'string' ? x.value.cid : "")
// 			.reduce((acc: string, value, index) => {
// 				return (value.length > 0 ? value + "," : "") + acc
// 			}).slice(0, -1)
// 		let fullURL = `https://farhoud.github.io/my-box/?box=QmemhZwyV9LhEv14qWYWdQqcYctQwxyBzutPUeU2DtYMgY&content=${images}`
// 		Clipboard.setString(fullURL);
// 		console.log(fullURL)
// 		Toast.show('Link is copied to clipboard', {
// 			duration: Toast.durations.LONG,
// 		});
// 	}
//
// 	const _handleUpload = async () => {
// 		console.log('Uploading');
// 		console.log(selectedAssetsRef.current);
// 		DeviceEventEmitter.emit("downloadStart", selectedAssetsRef.current)
// 	}
//
// 	const _handleMore = () => console.log('Shown more');
//
// 	const addUploadedFiles = async (assetId: string) => {
// 		try {
// 			const uploadedFileStr = await AsyncStorage.getItem('uploaded')
// 			await AsyncStorage.setItem('uploaded', JSON.stringify([...(uploadedFileStr != null ? JSON.parse(uploadedFileStr) : []), assetId]))
// 			console.log("upload ended")
// 		} catch (e) {
// 			console.log(e)
// 		}
// 	}
//
//
// 	return (
//
// 				<PinchZoom scale={scale} numColumnsAnimated={numColumnsAnimated}>
// 					{layouts.length ? <View>
// 						<Reanimated.View
// 							// eslint-disable-next-line react-native/no-inline-styles
// 							style={[animatedStyle, {
// 								flex: 1,
// 								width,
// 								height,
// 								position: 'absolute',
// 								top: 0,
// 								bottom: 0,
// 								right: 0,
// 								left: 0,
// 							}]}
// 						>
// 							{layouts.length>0 && layoutProvider && <RecyclerListView
// 								// ref={scrollRef}
// 								// externalScrollView={ExternalScrollView}
// 								style={{
// 									flex: 1,
// 									width,
// 									height,
// 									position: 'absolute',
// 									top: 0,
// 									bottom: 0,
// 									marginTop: 0,
// 									right: 0,
// 									left: 0,
// 									zIndex: 1,
// 								}}
// 								// optimizeForInsertDeleteAnimations={true}
// 								renderAheadOffset={200}
// 								dataProvider={dataProvider}
// 								layoutProvider={layoutProvider}
// 								rowRenderer={rowRenderer}
// 								// scrollViewProps={{
// 								// 	scrollRefExternal: scrollRefExternal,
// 								// 	_onScrollExternal: scrollHandlerReanimated,
// 								// }}
// 							/>}
//
// 							<ThumbScroll
// 								indicatorHeight={indicatorHeight}
// 								flexibleIndicator={false}
// 								shouldIndicatorHide={true}
// 								opacity={showThumbScroll}
// 								showFloatingFilters={showFloatingFilters}
// 								hideTimeout={500}
// 								dragY={dragY}
// 								headerHeight={headerHeight}
// 								FOOTER_HEIGHT={props.FOOTER_HEIGHT}
// 								HEADER_HEIGHT={props.HEADER_HEIGHT}
// 								scrollY={scrollYAnimated}
// 								scrollIndicatorContainerStyle={{}}
// 								scrollIndicatorStyle={{}}
// 								layoutHeight={layoutHeightAnimated}
// 								currentImageTimestamp={animatedTimeStampString}
// 							/>
// 							<FloatingFilters
// 								headerIndexes={headerIndexes}
// 								floatingFiltersOpacity={showFloatingFilters}
// 								numColumns={numColumns}
// 								sortCondition={sortCondition}
// 								headerHeight={headerHeight}
// 								FOOTER_HEIGHT={props.FOOTER_HEIGHT}
// 								HEADER_HEIGHT={props.HEADER_HEIGHT}
// 								indicatorHeight={indicatorHeight}
// 								layoutHeight={layoutHeightAnimated}
// 							/>
// 						</Reanimated.View>
//
//
// 						<SingleMedia
// 							modalShown={modalShown}
// 							setHeaderVisibility={setHeaderVisibility}
// 							animatedImagePositionX={animatedImagePositionX}
// 							animatedImagePositionY={animatedImagePositionY}
// 							animatedSingleMediaIndex={animatedSingleMediaIndex}
// 							singleImageWidth={singleImageWidth}
// 							singleImageHeight={singleImageHeight}
// 							numColumnsAnimated={numColumnsAnimated}
// 						/>
// 						<StoryHolder
// 							duration={1500}
// 							showStory={showStory}
// 							setHeaderVisibility={setHeaderVisibility}
// 						/>
// 						<ActionBar
// 							actionBarOpacity={actionBarOpacity}
// 							selectedAssets={selectedAssets}
// 							lastSelectedAssetId={lastSelectedAssetId}
// 							lastSelectedAssetAction={lastSelectedAssetAction}
// 							backAction={_goBack}
// 							actions={[
// 								{
// 									icon: "share-variant",
// 									onPress: _handleShare,
// 									color: "#007AFF",
// 									name: "share"
// 								},
// 								{
// 									icon: "plus",
// 									onPress: _handleAddToAlbum,
// 									color: "#007AFF",
// 									name: "add"
// 								},
// 								{
// 									icon: "trash-can-outline",
// 									onPress: _handleDelete,
// 									color: "#007AFF",
// 									name: "delete"
// 								},
// 								{
// 									icon: "download-lock-outline",
// 									onPress: _handleUpload,
// 									color: "#007AFF",
// 									name: "download"
// 								}
// 							]}
// 							moreActions={[]}
// 						/>
// 						{/*<ShareSheet*/}
// 						{/*	bottomSheetRef={shareBottomSheetRef}*/}
// 						{/*	opacity={shareBottomSheetOpacity.value}*/}
// 						{/*	FOOTER_HEIGHT={props.FOOTER_HEIGHT}*/}
// 						{/*	methods={{*/}
// 						{/*		shareLink: shareLink,*/}
// 						{/*		shareWithContact: shareWithContact,*/}
// 						{/*	}}*/}
// 						{/*/>*/}
// 						{/*<AlbumSheet*/}
// 						{/*	bottomSheetRef={albumBottomSheetRef}*/}
// 						{/*	opacity={albumBottomSheetOpacity}*/}
// 						{/*	FOOTER_HEIGHT={props.FOOTER_HEIGHT}*/}
// 						{/*	methods={{*/}
// 						{/*		addToAlbum: addToAlbum,*/}
// 						{/*		ChangeLastAlbumName: ChangeLastAlbumName,*/}
// 						{/*	}}*/}
// 						{/*/>*/}
// 					</View> : <View><Text>No Photos</Text></View>}
// 				</PinchZoom>
//
// 	);
// };
//
// export default Photos;
