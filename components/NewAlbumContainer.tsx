import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Text, View, useWindowDimensions, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';
import { Constant } from '../utils/constants';
interface Props {
	ChangeLastAlbumName: Function;
	addToAlbum: Function;
}

const NewAlbumContainer: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
	const navigation = useNavigation();

  useEffect(()=>{
    console.log([Date.now()+': component NewAlbumContainer rendered']);
  });
  useEffect(() => {
    console.log(['component NewAlbumContainer mounted']);
      return () => {console.log(['component NewAlbumContainer unmounted']);}
  }, []);

	const goToPage = (pageName:string) => {
		navigation.navigate(pageName, {HEADER_HEIGHT: Constant.HEADER_HEIGHT});
	}

  return (
    <View
      style={{
        flex: 1,
        flexDirection:'column',
        width: SCREEN_WIDTH,
        position: 'relative',
        zIndex:10,
      }}
    >
        <ScrollView style={styles.scrollView}>
						<TouchableHighlight 
							style={styles.menuItem}
							activeOpacity={0.2}
							underlayColor="#DDDDDD"
							onPress={()=>{goToPage('ImportGoogle');}}
						>
							<Text style={styles.text}>
								Import from Google Photos
							</Text>
						</TouchableHighlight>
		</ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
	scrollView: {
    marginHorizontal: 20,
		flex: 1,
		flexDirection: 'column'
  },
	menuItem: {
		flex: 1,
		borderBottomWidth: 1,
		borderBottomColor: 'lightgrey',
		flexDirection: 'row',
		height: 60,
		textAlignVertical: 'center',
		justifyContent: 'center'
	},
	text: {
		flex: 1,
		flexDirection:'row',
		justifyContent: 'center',
		textAlignVertical: 'center'
	}
});
const isEqual = (prevProps:Props, nextProps:Props) => {
  return true;
}
export default React.memo(NewAlbumContainer, isEqual);
