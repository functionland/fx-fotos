import React, { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, StatusBar, Text, TouchableHighlight, Button, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { default as Reanimated, } from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { unzip, ZipEntry } from 'unzipit';
import { StatelessFileReader } from '../utils/statelessFileReader'
import ZipFileExplorer from '../components/zipFileExplorer';
import { Checkbox } from 'react-native-paper';
interface Props {
	navigation: any;
	route: { params: { HEADER_HEIGHT: number; FOOTER_HEIGHT: number; headerShown: Reanimated.SharedValue<number>; zipFile: string } }
}

const ZipFileUploader: React.FC<Props> = (props) => {
	console.log(Date.now() + ': ZipFileUploader re-rendered');
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
	React.useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Checkbox
					status={checkedAll ? 'checked' : 'unchecked'}
					onPress={() => {
						console.log("checkedAll:",checkedAll);
						setCheckedAll(!checkedAll);
					}}
				/>
			),
		});
	}, [navigation,checkedAll]);

	const loadZipEntry = async () => {
		try {
			const reader = new StatelessFileReader('file://' + zipFile);
			const { zip, entries } = await unzip(reader);
			setZipEntry(entries);
		} catch (error) {
			console.log(error);
		}
	}

	const uploadFile = async (key: string) => {
        return new Promise<'upload' | 'done' | 'error'>((resolve, reject) => {
            setTimeout(() => {
                resolve('done');
            }, 500);
        });
    }
	return (
		<SafeAreaView style={styles.SafeAreaView}>
			<View style={[
				styles.View,
				{
					width: SCREEN_WIDTH,
					zIndex: 1,
					marginTop: ((StatusBar.currentHeight || 0) + (2 * props.route.params.HEADER_HEIGHT || 0))
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
