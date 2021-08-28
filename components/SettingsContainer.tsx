import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Text, View, useWindowDimensions, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';

import {
  useRecoilState,
} from 'recoil';
import {photosState, } from '../states';
import {default as Reanimated,} from 'react-native-reanimated';
interface Props {
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
}

const PhotosContainer: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
	const navigation = useNavigation();

  useEffect(()=>{
    console.log([Date.now()+': component SettingsContainer rendered']);
  });
  useEffect(() => {
    console.log(['component SettingsContainer mounted']);
      return () => {console.log(['component SettingsContainer unmounted']);}
  }, []);

	const goToPage = (pageName:string) => {
		navigation.navigate(pageName, {HEADER_HEIGHT: props.HEADER_HEIGHT});
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
  return (prevProps.HEADER_HEIGHT === nextProps.HEADER_HEIGHT);
}
export default React.memo(PhotosContainer, isEqual);
