import React from 'react';
import {StoryViewProps} from '../utils/interfaceHelper';
import {Dimensions, SafeAreaView, StyleSheet, View} from 'react-native';
import ProgressiveImage from './ProgressiveImage';

function StoryView(props: StoryViewProps) {
  // const [refresh, setRefresh] = useState(true);

  const image = props.images[props.progressIndex];
  // console.log(image);

  return (
    <SafeAreaView
      style={styles.divStory}
      key={props.id + '_SafeAreaView_View_ProgressiveImage_' + image?.uri}>
      <View
        style={styles.divStory}
        key={props.id + '_View_ProgressiveImage_' + image?.uri}>
        <ProgressiveImage
          style={props.imageStyle ? props.imageStyle : styles.imgStyle}
          imgSource={{uri: image?.uri}}
          thumbnailSource={{uri: image?.uri}}
          id={props.id + '_ProgressiveImage_' + image?.uri}
        />
      </View>
    </SafeAreaView>
  );
}

export default StoryView;

const styles = StyleSheet.create({
  divStory: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    alignContent: 'center',
    alignItems: 'center',
    zIndex: 80,
  },
  imgStyle: {
    position: 'relative',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    alignSelf: 'center',
    resizeMode: 'stretch',
    zIndex: 80,
  },
});
