import React, {useEffect} from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, StatusBar } from 'react-native';
import NewAlbumContainer from '../components/NewAlbumContainer';
import {default as Reanimated,} from 'react-native-reanimated';
import { Constant } from '../utils/constants';

interface Props {
  navigation: any;
  route: {params:{
		ChangeLastAlbumName: Function;
		addToAlbum: Function;
	}}
}

const NewAlbum: React.FC<Props> = (props) => {
  useEffect(()=>{
    console.log(Date.now()+': NewAlbum re-rendered');
  });
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={[
				styles.View, 
				{
					width: SCREEN_WIDTH, 
					zIndex:1, 
					marginTop:((StatusBar.currentHeight||0)+(2*Constant.HEADER_HEIGHT||0))
				}
			]}>
        <NewAlbumContainer 
					ChangeLastAlbumName={props.route.params.ChangeLastAlbumName}
					addToAlbum={props.route.params.addToAlbum}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white'
  },
  View: {
    position: 'relative',
    left: 0,
		flex: 1,
  }
});
const isEqual = (prevProps:Props, nextProps:Props) => {
  return true;
}
export default React.memo(NewAlbum, isEqual);
