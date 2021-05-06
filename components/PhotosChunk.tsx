import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import {Animated, FlatList, Text, StyleSheet, Dimensions, View} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
interface Props {
  photos: Array<MediaLibrary.Asset>;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  loading: boolean;
  scale: Animated.Value;
}

const renderPhoto = (
  photo: MediaLibrary.Asset,
  opacity: Animated.AnimatedInterpolation,
  numCol: 2 | 3 | 4,
  loading: boolean,
) => {
  return (
    <View style={[styles.AnimatedView,{flex: 1/numCol,}]}>
      <Animated.Image
        source={{uri: photo.uri}}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: SCREEN_WIDTH / numCol,
          width: SCREEN_WIDTH / numCol,
          backgroundColor: loading ? 'grey' : 'white',
          margin: 1,
        }}
        key={photo.uri}
      />
    </View>
    //  <Text>{photo.uri}</Text>
  );
};

const PhotosChunk: React.FC<Props> = (props) => {
  return (
    <View
      style={styles.AnimatedView}
      key={'PhotoChunkHolderView_' + props.numCol}>
      <FlatList
        data={props.photos}
        numColumns={props.numCol}
        renderItem={({item}) =>
          renderPhoto(item, props.opacity, props.numCol, props.loading)
        }
        style={styles.FlatList}
        columnWrapperStyle={{alignItems:'flex-start', }}
      />
    </View>
  );
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
  AnimatedView: {
    width: SCREEN_WIDTH,
  },
});
export default PhotosChunk;
