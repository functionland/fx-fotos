import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import {Animated, FlatList, Text, StyleSheet, Dimensions, View} from 'react-native';
import {event} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {reduxState} from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('window').width;
interface Props {
  photos: Array<MediaLibrary.Asset>;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  setWrapperHeight: Function;
}

const renderPhoto = (
  photo: MediaLibrary.Asset,
  opacity: Animated.AnimatedInterpolation,
  numCol: 2 | 3 | 4,
  loading: boolean,
) => {
  return (
    <View style={styles.AnimatedView}>
      <Animated.Image
        source={{uri: photo.uri}}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: SCREEN_WIDTH / numCol,
          backgroundColor: loading ? 'grey' : 'white',
          margin: 3,
        }}
        key={photo.uri}
      />
    </View>
    //  <Text>{photo.uri}</Text>
  );
};

const PhotosChunk: React.FC<Props> = (props) => {
  const loading = useSelector((state: reduxState) => state.loading);
  return (
    <Animated.View
      style={styles.AnimatedView}
      key={'PhotoChunkHolderView_' + props.numCol}>
      <FlatList
        data={props.photos}
        numColumns={props.numCol}
        renderItem={({item}) =>
          renderPhoto(item, props.opacity, props.numCol, loading)
        }
        style={styles.FlatList}
      />
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  FlatList: {
    //flexDirection: 'row',
    flex: 1,
    //flexWrap: 'wrap',
    //flexGrow: 1,
  },
  AnimatedView: {
    flex: 1,
  },
});
export default PhotosChunk;
