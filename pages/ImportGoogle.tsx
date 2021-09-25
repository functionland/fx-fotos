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
interface Props {
	navigation: any;
	route: { params: { HEADER_HEIGHT: number; FOOTER_HEIGHT: number; headerShown: Reanimated.SharedValue<number>; } }
}

const ImportGoogle: React.FC<Props> = (props) => {
	console.log(Date.now() + ': ImportGoogle re-rendered');

	
	useEffect(() => {
		console.log(Date.now() + ': ImportGoogle mounted');
	});
	const SCREEN_WIDTH = useWindowDimensions().width;
	const SCREEN_HEIGHT = useWindowDimensions().height;
	const navigation = useNavigation();
	const [imageList, setImageList] = useState<string[]>([]);
	const {HEADER_HEIGHT}=props.route.params
	useEffect(() => {
		if (imageList.length) {
			console.log(imageList);
		}
	}, [imageList])
	const openLink = (url: string) => {
		return Linking.canOpenURL(url).then(
			async (url2) => {
				WebBrowser.openBrowserAsync(url, {
					createTask: true,
				});
			}
		)
	};

	/*const readCacheDirectory = async() => {
		const entries = await FileSystem.readDirectoryAsync(
		  FileSystem.cacheDirectory + "photosUnzipped/Takeout/Google Photos"
		);
		setImageList(entries);
	}*/
	const openDocumentSelector = async () => {
		let options = {
			//base64: false,
			//copyToCacheDirectory: true,
			type: '*/*',
		}
		let selectedDoc = await DocumentPicker.getDocumentAsync(options);
		if (selectedDoc.type === 'success') {
			console.log('reading zip file' + selectedDoc.output);
			try {
				console.log("selectedDoc:", selectedDoc);
				console.log("FileSystem.cacheDirectory:", FileSystem.cacheDirectory);
				const targetPath = FileSystem.cacheDirectory + "photosUnzipped";
				/*unzip(selectedDoc.uri, targetPath, "UTF-8")
				.then((path) => {
				console.log(`unzip completed at ${path}`);
				})
				.catch((error) => {
				console.error(error);
				});*/

				try {
					// FileSystem.getContentUriAsync('file://'+selectedDoc.uri).then(async cUri => {
					// 	console.log('cUri:',cUri);

					//   });

					// const base64String=await FileSystem.readAsStringAsync('file://'+selectedDoc.uri,{
					// 	encoding:"base64",
					// 	//position:0,
					// 	//length:100*1024
					// });
					// console.log("blob:",base64String);
					// const byteArray = new Buffer(base64String.replace(/^[\w\d;:\/]+base64\,/g, ''), 'base64');
					// const zipFile=await unzip(byteArray);
					// //setZipEntity(zipFile);

					// console.log("zipFile:",zipFile);
					const reader = new StatelessFileReader('file://' + selectedDoc.uri);
					//const { zip, entries } = await unzip(reader);
					//setZipEntry(entries);
					navigation.navigate("ZipFileUploader",{
						zipFile:selectedDoc.uri,
						HEADER_HEIGHT: HEADER_HEIGHT
					});
					// const fetchResponse = await fetch('file:///'+selectedDoc.uri);
					// console.log('fetchResponse', fetchResponse);
					// const blob = await fetchResponse.blob();
					// console.log('blob', blob);
				} catch (error) {
					console.log('ERR: ' + error.message);
				}

			} catch (e) {
				console.log(e);
			}
		}
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
				<ScrollView>

					<View
						style={styles.main}
					>
						<View>

							<Text>
								You can easily import your photos from Google Photos to your backend of choice.Simply follow these steps:
							</Text>
							<View>
								<Text>1- Open Google tool for export: </Text>
								<TouchableHighlight
									style={styles.button}
									activeOpacity={0.2}
									underlayColor="#DDDDDD"
									onPress={() => { openLink("https://takeout.google.com/"); }}
								>
									<Text style={styles.text}>"https://takeout.google.com/"</Text>
								</TouchableHighlight>
							</View>
							<Text>
								2- Scroll down to "CREATE A NEW EXPORT" and click on "Deselect all"
							</Text>
							<Text>
								3- Scroll down to find "Google Photos", and select it by clicking the checkbox next to it
							</Text>
							<Text>
								4- Click "Next Step"
							</Text>
							<Text>
								5- Scroll down and Click "Create Export"
							</Text>
							<Text>
								6- Wait for about an hour for the export link to be sent to your email and then click on it an download the file
							</Text>
							<Text>
								7- Upload the zip file using the button below
							</Text>
						</View>
						
						<View>
							<Button
								onPress={openDocumentSelector}
								title="Import Downloaded zip File"
								color="#841584"
								accessibilityLabel="Open document picker to select import file"
							/>
						</View>
					</View>
				</ScrollView>
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
		//	position: 'absolute',
		// top: 0,
		// left: 0,
		padding: 5,
		paddingBottom: 0
	},
	main: {
		flex: 1,
		flexDirection: 'column'
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
export default React.memo(ImportGoogle, isEqual);
