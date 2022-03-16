import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {TextInput, View, useWindowDimensions, StyleSheet, Button } from 'react-native';
import { Constant } from '../utils/constants';
interface Props {
	ChangeLastAlbumName: Function;
	addToAlbum: Function;
}

const NewAlbumContainer: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
  const navigation = useNavigation();
  const [albumName, setAlbumName] = React.useState('');
  const onChangeAlbumName = (input: string) => {
	setAlbumName(input);
  }
  const onSubmit = () => {
	props.ChangeLastAlbumName(albumName);
	props.addToAlbum();
	navigation.goBack();
  }
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
		<TextInput
			style={styles.input}
			onChangeText={onChangeAlbumName}
			value={albumName}
			placeholder="Enter an album name"
		/>
		<Button
			onPress={onSubmit}
			title="Save"
			color="#841584"
			accessibilityLabel="Save new album"
		/>
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
	},
	input: {
		height: 40,
		margin: 12,
		borderWidth: 1,
		padding: 10,
	},
});
const isEqual = (prevProps:Props, nextProps:Props) => {
  return true;
}
export default React.memo(NewAlbumContainer, isEqual);
