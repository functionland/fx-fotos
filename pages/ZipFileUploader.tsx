import React, { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, StatusBar, Text, TouchableHighlight, Button, ScrollView, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { default as Reanimated, } from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { unzip, ZipEntry } from 'unzipit';
import * as mime from 'react-native-mime-types';

import { StatelessFileReader } from '../utils/statelessFileReader'
import ZipFileExplorer from '../components/zipFileExplorer';
import { IconButton } from 'react-native-paper';
import { MediaType } from 'expo-media-library';
import { useBackEndProviders } from '../backend';
import { identityState } from '../states';
import { useRecoilState } from 'recoil';
import { getFileNameWithExtention, mimeToMediaType } from '../utils/functions';
import { UploadProcessStatus } from '../types';
import { albumMetadata, metadata } from '../types/interfaces'
import { albumsState } from '../states';

interface Props {
	navigation: any;
	route: { params: { HEADER_HEIGHT: number; FOOTER_HEIGHT: number; headerShown: Reanimated.SharedValue<number>; zipFile: string } }
}

const ZipFileUploader: React.FC<Props> = (props) => {
	console.log(Date.now() + ': ZipFileUploader re-rendered');
	const [albums, setAlbums] = useRecoilState(albumsState);
	const [identity] = useRecoilState(identityState);
	const { _userId, _videoUploadController, upload, getMedias, share, backendSettings, addMediaToAlbum, getAlbums, createAlbum } = useBackEndProviders({ backend: 'dfinity', identity: identity, requireProfile: true });

	const [checkedAll, setCheckedAll] = useState(false);
	const SCREEN_WIDTH = useWindowDimensions().width;
	const [zipEntry, setZipEntry] = useState<{ [key: string]: ZipEntry }>({});
	const { route, navigation } = props;
	const { zipFile } = route.params;
	console.log("ZipFileUploader.zipFile:", zipFile)

	useEffect(() => {
		console.log(Date.now() + ': ZipFileUploader mounted');
		loadZipEntry();
	}, []);
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<IconButton
					icon={checkedAll ? "checkbox-multiple-marked-outline" : "checkbox-multiple-blank-outline"}
					size={26}
					onPress={() => {
						setTimeout(() => {
							setCheckedAll(!checkedAll);
						}, 0);
					}}
				/>

			),
		});
	}, [navigation, checkedAll]);

	const loadZipEntry = async () => {
		try {
			const fileUri = zipFile.startsWith('file://') ? zipFile : 'file://' + zipFile;
			const reader = new StatelessFileReader(fileUri);
			const { zip, entries } = await unzip(reader);
			setZipEntry(entries);
		} catch (error) {
			console.log(error);
		}
	}
	const getFileMetadata = async (key: string): Promise<metadata> => {
		try {
			if (!zipEntry)
				throw 'The zip file entry is null!'
			let fileName = getFileNameWithExtention(key);
			let metadataFilePath = key.replace(fileName, fileName.split('.')?.[0] + '.json');

			const albumData = await zipEntry[metadataFilePath].json();
			const result: metadata = {
				name: albumData.title,
				caption: albumData.description,
				createdAt: Number(Number(albumData.creationTime?.timestamp)),
				photoTakenTime: Number(albumData.photoTakenTime?.timestamp),
				lastModifiedAt: Number(albumData.photoLastModifiedTime?.timestamp),
				geoData: {
					latitude: albumData.geoData?.latitude.toString(),
					longitude: albumData.geoData?.longitude.toString(),
					altitude: albumData.geoData?.altitude.toString(),
					latitudeSpan: albumData.geoData?.latitudeSpan.toString(),
					longitudeSpan: albumData.geoData?.longitudeSpan.toString()
				},
				geoDataExif: {
					latitude: albumData.geoDataExif?.latitude.toString(),
					longitude: albumData.geoDataExif?.longitude.toString(),
					altitude: albumData.geoDataExif?.altitude.toString(),
					latitudeSpan: albumData.geoDataExif?.latitudeSpan.toString(),
					longitudeSpan: albumData.geoDataExif?.longitudeSpan.toString()
				},
				people: albumData.people,
				uploadedFrom: {
					url: albumData.url,
					localFolderName: albumData.googlePhotosOrigin?.mobileUpload?.deviceFolder?.localFolderName,
					deviceType: albumData.googlePhotosOrigin?.mobileUpload?.deviceType
				},
				viewCount: Number(albumData.imageViews)
			}
			return result;

		} catch (error) {
			console.log('getFileMetadata:', error)
			throw error;
		}
	}
	const getAlbumMetadata = async (key: string): Promise<albumMetadata | null> => {
		try {
			if (!zipEntry)
				throw 'The zip file entry is null!'
			let fileName = getFileNameWithExtention(key);
			let albumMetadataFilePath = key.replace(fileName, 'metadata.json');
			const fileData = await zipEntry[albumMetadataFilePath].json();
			const { albumData = {} } = fileData;
			const result: albumMetadata = {
				name: albumData.title,
				description: albumData.description,
				access: albumData.access,
				date: albumData.formatted,
				geoData: {
					latitude: albumData.geoData?.latitude.toString(),
					longitude: albumData.geoData?.longitude.toString(),
					altitude: albumData.geoData?.altitude.toString(),
					latitudeSpan: albumData.geoData?.latitudeSpan.toString(),
					longitudeSpan: albumData.geoData?.longitudeSpan.toString()
				},
			}
			return result;

		} catch (error) {
			return null;
		}
	}
	const uploadAlbumMetadata = async (medatadat: albumMetadata | null) => {
		try {
			if (!medatadat || !medatadat.name || albums.find(album => album.name === medatadat?.name))
				return;
			setAlbums(albums => [...albums, {
				name: medatadat?.name
			}]);
			await createAlbum(medatadat.name, medatadat);
		} catch (error) {
			return
		}
	}
	const uploadFile = async (key: string): Promise<void> => {
		try {
			if (!zipEntry)
				throw 'The zip file entry is null!'
			const fileMetadata = await getFileMetadata(key);
			const albumMetadata = await getAlbumMetadata(key);
			await uploadAlbumMetadata(albumMetadata);

			const albumData = await zipEntry[key].arrayBuffer();
			const mediaFile: File = {
				lastModified: new Date().getTime(),
				name: getFileNameWithExtention(key),
				size: albumData.byteLength,
				arrayBuffer: async () => { return albumData; },
				type: mimeToMediaType(mime.lookup(key)),
				slice: (albumData.slice as any),
				stream: (): any => { },
				text: async () => { return ''; },
				webkitRelativePath: ''
			}
			const fileId = getFileNameWithExtention(fileMetadata.uploadedFrom?.url || key);
			await upload(mediaFile, '', fileId, fileMetadata);
		} catch (error) {
			console.log('uploadFile:', error)
			throw error;
		}
	}
	return (
		<SafeAreaView style={styles.SafeAreaView}>
			<View style={[
				styles.View,
				{
					width: SCREEN_WIDTH,
					zIndex: 1,
					marginTop: Platform.OS=="android"?((StatusBar.currentHeight || 0) + (2 * props.route.params.HEADER_HEIGHT || 0)):0
				}
			]}>
				<View
					style={styles.main}
				>
					<ZipFileExplorer
						zipEntry={zipEntry}
						checkedAll={checkedAll}
						uploadFile={uploadFile}
					//onFinish={()=>setCheckedAll(false)}
					/>
				</View >
			</View >
		</SafeAreaView >
	);
};

const styles = StyleSheet.create({
	SafeAreaView: {
		flex: 1,
		position: 'relative',
		backgroundColor: 'white'
	},
	View: {
		flex: 1,
		//	position: 'absolute',
		// top: 0,
		// left: 0,
		padding: 5,
		paddingBottom: 0,
	},
	main: {
		flex: 1,
		flexDirection: 'column',

	},
	button: {
		flex: 1,
		flexDirection: 'row',
		height: 40,
		textAlignVertical: 'center',
		justifyContent: 'center'
	},
	text: {
		justifyContent: 'center',
		textAlignVertical: 'center',
		flex: 1,
		flexDirection: 'row',
	}
});
const isEqual = (prevProps: Props, nextProps: Props) => {
	return (prevProps.route.params.HEADER_HEIGHT === nextProps.route.params.HEADER_HEIGHT);
}
export default React.memo(ZipFileUploader, isEqual);
