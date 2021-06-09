import { Asset } from 'expo-media-library';
import React, {useEffect, useRef, useState, createRef} from 'react';
import { View, SafeAreaView, useWindowDimensions, StyleSheet, Image } from 'react-native';
import StoryContainer from './Story/stories/StoryContainer';
import {story, } from '../types/interfaces';
import { useBackHandler } from '@react-native-community/hooks';
import { timestampToDate } from '../utils/functions';

import {
  BAR_ACTIVE_COLOR,
  BAR_INACTIVE_COLOR,
} from './Story/utils/colors';

interface Props {
    story:story|undefined;
  duration: number;
  showStory: boolean;
  setShowStory: Function;
}

const StoryHolder: React.FC<Props> = (props) => {
  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {isMounted.current = false;}
  }, []);


  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  useBackHandler(() => {
      if (props.showStory) {
        props.setShowStory(false);
        return true;
      }
      // let the default thing happen
      return false;
  });

  return props.story ? (
    <View style={
      {
        flex: 1, 
        flexDirection: 'column', 
        position: 'absolute', 
        top:0, 
        left:0, 
        opacity:props.showStory?1:0,
        width:props.showStory?SCREEN_WIDTH:0,
        height:props.showStory?SCREEN_HEIGHT:0,
        zIndex:5,
        backgroundColor:'black',
      }
    }>
      {/* Individual Story View component */}
      <StoryContainer
        visible={props.showStory}
        enableProgress={true}
        images={props.story.medias}
        id={"Story_"+Math.random()}
        duration={5}
        containerStyle={{
          width: '100%',
          height: '100%',
          zIndex:6,
        }}
        // Inbuilt User Information in header
        userProfile={{
            userName: timestampToDate(props.story?.medias[0]?.modificationTime,['day']).day,
        }}
        // Custom Header component option

        // ProgressBar style options
        barStyle={{
          barActiveColor: BAR_ACTIVE_COLOR,
          barInActiveColor: BAR_INACTIVE_COLOR,
          //barWidth: 100, // always in number
          barHeight: 3, // always in number
        }}
        // Story Image style options
        imageStyle={{
          width: SCREEN_WIDTH, // always in number
          height: SCREEN_WIDTH, // always in number
        }}

        //Callback when status view completes
        onComplete={() => props.setShowStory(false)}
      />
    </View>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  media: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10
  },
  storyHolder: {

  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex:5,
  },
});

export default StoryHolder;
