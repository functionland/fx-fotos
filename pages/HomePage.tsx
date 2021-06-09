import React from 'react';
import { SafeAreaView, StyleSheet, Animated, View, useWindowDimensions, StatusBar } from 'react-native';
import PhotosContainer from '../components/PhotosContainer';
import { useEffect } from 'react';

interface Props {
  scrollAnim: Animated.Value;
  HEADER_HEIGHT: number;
  headerShown: Animated.Value;
}

const HomePage: React.FC<Props> = (props) => {
  useEffect(()=>{
    console.log(Date.now()+': HomePage re-rendered');
  })
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={[styles.View, {width: SCREEN_WIDTH, zIndex:1, marginTop:(StatusBar.currentHeight||0)}]}>
        <PhotosContainer 
          scrollAnim={props.scrollAnim} 
          HEADER_HEIGHT={props.HEADER_HEIGHT} 
          headerShown={props.headerShown}
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
    position: 'absolute',
    top: 0,
    left: 0
  }
});
export default HomePage;
