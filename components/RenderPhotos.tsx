import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import {
  SectionList,
  Animated,
  Dimensions,
  Text,
  StyleSheet,
  StatusBar,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {photoChunk, reduxState} from '../types/interfaces';
import PhotosChunk from './PhotosChunk';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: Array<photoChunk>;
  margin: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  numColumns: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  loading: boolean;
  separator: 'day' | 'month';
  getMorePhotosFunction: Function;
  setWrapperHeight: Function;
  wrapperHeight: number | undefined;
  zIndex: number;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const numColumns = useSelector((state: reduxState) => state.numColumns);

  console.log('numColumns', numColumns);

  return props.photos ? (
    <Animated.View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        height: props.wrapperHeight,
        position: 'absolute',
        top: 0,
        bottom: 0,
        marginTop: StatusBar.currentHeight || 0,
        right: 0,
        left: 0,
        opacity: props.opacity,
        zIndex: props.zIndex,
      }}>
      <SectionList
        sections={props.photos}
        //keyExtractor={(item, index) => item.uri + index}
        renderItem={({item}) =>
          <PhotosChunk
            photos={item}
            opacity={props.opacity}
            numCol={props.numColumns}
            setWrapperHeight={props.setWrapperHeight}
            //key={'PhotosChunk' + numCol}
          />
        }
        onEndReached={() => console.log('getting photo')}
        // contentContainerStyle={{flexGrow: 1}}
        onEndReachedThreshold={0.9}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          flex: 1,
          width: SCREEN_WIDTH,
          height: props.wrapperHeight,
          position: 'absolute',
          top: 0,
          bottom: 0,
          marginTop: 0,
          right: 0,
          left: 0,
        }}
        renderSectionHeader={({section: {date}}) => (
          <Text style={styles.header}>{date}</Text>
        )}
        key={props.separator + props.numColumns}
      />
    </Animated.View>
  ) : (
    <Animated.View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        height: props.wrapperHeight,
        position: 'absolute',
        top: 0,
        bottom: 0,
        marginTop: StatusBar.currentHeight || 0,
        right: 0,
        left: 0,
        opacity: props.opacity,
      }}>
      <Text>Loading...</Text>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    backgroundColor: '#fff',
  },
});
export default RenderPhotos;
