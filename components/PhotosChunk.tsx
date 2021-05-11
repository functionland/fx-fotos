import {Asset} from 'expo-media-library';
import React, {useEffect, useState} from 'react';
import {Animated, Image, Text, StyleSheet, Dimensions, View, Platform} from 'react-native';
import { flatMedia } from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('window').width;
const isIOS = Platform.OS === 'ios';
interface Props {
  photo: Asset|string;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  loading: boolean;
  scale: Animated.Value;
}

const PhotosChunk: React.FC<Props> = (props) => {
  const [imageRef, setImageRef] = useState<Image | null>();
  useEffect(()=>{
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 0,
      });
    }
  },[imageRef,isIOS]);
  const handleOnLoad = () => {
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 1,
      });
    }
  };
  
  if(typeof props.photo === 'string'){
    return (
      <View style={{flex: 1, width: SCREEN_WIDTH,}}>
        <Text>{props.photo}</Text>
      </View>
    )
  }else{
    return (
      <View style={{flex: 1/props.numCol, width: SCREEN_WIDTH/props.numCol,}}>
        <Image
          ref={ref => {
            setImageRef(ref);
          }}
          source={{uri: props.photo.uri}}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            height: SCREEN_WIDTH / props.numCol,
            width: SCREEN_WIDTH / props.numCol,
            backgroundColor: props.loading ? 'grey' : 'white',
            margin: 1,
          }}
          key={props.photo.uri}
          onLoad={handleOnLoad}
        />
      </View>
    );
  }
};
const styles = StyleSheet.create({
  FlatList: {
    //flexDirection: "row",
    //flex: 1,
    //flexWrap:"wrap",
    width: SCREEN_WIDTH,
    //flexWrap: 'wrap',
    //flexGrow: 1,
  },
});
export default PhotosChunk;
