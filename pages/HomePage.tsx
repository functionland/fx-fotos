import React, {useEffect} from 'react';
import { SafeAreaView, StyleSheet, Animated, View, useWindowDimensions, StatusBar } from 'react-native';
import PhotosContainer from '../components/PhotosContainer';

interface Props {
  scrollY2: Animated.Value;
  scrollY3: Animated.Value;
  scrollY4: Animated.Value;
  scale: Animated.Value;
  baseScale: Animated.AnimatedAddition;
  baseScale2: Animated.Value;
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
          scrollY2={props.scrollY2} 
          scrollY3={props.scrollY3} 
          scrollY4={props.scrollY4} 
          scale={props.scale} 
          baseScale={props.baseScale} 
          baseScale2={props.baseScale2} 
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
