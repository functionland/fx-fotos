import React from 'react';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import PhotosContainer from '../components/PhotosContainer';

interface Props {
  scrollAnim: Animated.Value;
  HEADER_HEIGHT: number;
  setHeaderShown: Function;
}

const HomePage: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View
        style={[
          styles.View,
          {
            width: SCREEN_WIDTH,
            zIndex: 1,
            marginTop: StatusBar.currentHeight || 0,
          },
        ]}>
        <PhotosContainer
          scrollAnim={props.scrollAnim}
          HEADER_HEIGHT={props.HEADER_HEIGHT}
          setHeaderShown={props.setHeaderShown}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
  View: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
export default HomePage;
