import { Asset } from 'expo-media-library';
import React, {useEffect, useRef, useState, createRef} from 'react';
import { View, useWindowDimensions, StyleSheet, Image, Text, Animated } from 'react-native';
import {story, } from '../types/interfaces';
import { useBackHandler } from '@react-native-community/hooks'

import {
  TapGestureHandler,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';

interface Props {
  story:story;
  duration: number;
  numColumns: 2|3|4;
  text?: string | undefined;
  height: number;
  showStory:Animated.Value;
  headerShown: Animated.Value;
  setStory:Function;
}

const Highlights: React.FC<Props> = (props) => {
  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {isMounted.current = false;}
  }, []);

  useEffect(()=>{
    
    console.log(props.story);
  },[props.story])

  const SCREEN_WIDTH = useWindowDimensions().width;

  const _tapRef = createRef<TapGestureHandler>();

  const openHighlight = () => {
    props.setStory(props.story);
    console.log('opening highlight');
    props.showStory.setValue(1);
    props.headerShown.setValue(0);
    ////console.log('here');
  }

  const _onTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.state === State.END){
      if(props.story && props.story.medias){
        openHighlight();
      }
    }
  }

  return props.story ? (
    <TapGestureHandler
      maxDist={3}
      numberOfTaps={1}
      ref={_tapRef}
      onHandlerStateChange={_onTapHandlerStateChange}
    >
      <View 
        style= {[
          styles.container, 
          {
            width: props.height/1.618,
            height: props.height
          }
        ]}
      >
        <Image
          style= {[
            styles.media, 
            {
              width: SCREEN_WIDTH/3,
              height: 1.618*SCREEN_WIDTH/3
            }
          ]}
          source={
            {uri: props.story?.medias[0]?.uri}
          }
        />
        <View
          style={[
            styles.mediaOverlay, {
              width: SCREEN_WIDTH/3,
              height: 1.618*SCREEN_WIDTH/3
            }
          ]}
        >

        </View>
        <View style={styles.textHolder}>
          <Text style={styles.text}>
            {props.story?.text}
          </Text>
        </View>
      </View>
    </TapGestureHandler>
  ) : (
    <Text></Text>
  );
};

const styles = StyleSheet.create({
  media: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
  },
  mediaOverlay: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.3,
    backgroundColor: 'black'
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 22,
    textShadowColor: 'black',
    textShadowRadius: 4
  },
  textHolder:{
    height: 50,
    width:'100%',
    position: 'absolute',
    bottom: 0,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex:5,
    alignItems: 'center',
  },
});

export default Highlights;
