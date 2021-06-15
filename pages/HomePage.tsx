import React, {useEffect} from 'react';
import { SafeAreaView, StyleSheet, Animated, View, useWindowDimensions, StatusBar } from 'react-native';
import PhotosContainer from '../components/PhotosContainer';
import {default as Reanimated,} from 'react-native-reanimated';

interface Props {
  scrollY2: Reanimated.SharedValue<number>;
  scrollY3: Reanimated.SharedValue<number>;
  scrollY4: Reanimated.SharedValue<number>;
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
}

const HomePage: React.FC<Props> = (props) => {
  useEffect(()=>{
    console.log(Date.now()+': HomePage re-rendered');
  });
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
          numColumnsAnimated={props.numColumnsAnimated} 
          HEADER_HEIGHT={props.HEADER_HEIGHT} 
          FOOTER_HEIGHT={props.FOOTER_HEIGHT}
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
export default React.memo(HomePage);
