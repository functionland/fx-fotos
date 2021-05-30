import React from 'react';
import {SafeAreaView, StyleSheet, Animated, View, useWindowDimensions} from 'react-native';
import PhotosContainer from '../components/PhotosContainer';
import Header from '../components/Header';
interface Props {
  scrollAnim: Animated.Value;
  HEADER_HEIGHT: number;
}

const HomePage: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={[styles.View, {width: SCREEN_WIDTH, zIndex:2}]}>
        <Header scrollAnim={props.scrollAnim} HEADER_HEIGHT={props.HEADER_HEIGHT} />
      </View>
      <View style={[styles.View, {width: SCREEN_WIDTH, zIndex:1, }]}>
        <PhotosContainer scrollAnim={props.scrollAnim} HEADER_HEIGHT={props.HEADER_HEIGHT} />
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
    position: 'absolute',
    top: 0,
    left: 0
  }
});

export default HomePage;
