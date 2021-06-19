import { Asset } from 'expo-media-library';
import React, {useEffect, useRef,} from 'react';
import { View, Animated, useWindowDimensions, StyleSheet, } from 'react-native';
import StoryContainer from './Story/stories/StoryContainer';
import {story, } from '../types/interfaces';
import { timestampToDate } from '../utils/functions';

import {
  BAR_ACTIVE_COLOR,
  BAR_INACTIVE_COLOR,
} from './Story/utils/colors';
import {
  useRecoilState,
} from 'recoil';
import {storyState} from '../states';
import { default as Reanimated } from 'react-native-reanimated';

interface Props {
  duration: number;
  showStory: Animated.Value;
  headerShown: Reanimated.SharedValue<number>;
}

const StoryHolder: React.FC<Props> = (props) => {
  const [story, setStory] = useRecoilState(storyState);

  const close = () => {
    props.showStory.setValue(0);
    props.headerShown.value = 1;
  }
  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      }
  }, []);

  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return story ? (
    <Animated.View style={
      {
        flex: 1, 
        flexDirection: 'column', 
        position: 'absolute', 
        top:0, 
        left:0, 
        opacity:props.showStory,
        width:SCREEN_WIDTH,
        height:SCREEN_HEIGHT,
        zIndex:Animated.multiply(5, props.showStory),
        backgroundColor:'black',
        transform:[
          {
            scale: props.showStory
          }
        ]
      }
    }>
      {/* Individual Story View component */}
      <StoryContainer
        visible={props.showStory}
        enableProgress={true}
        images={story?.medias}
        id={"Story_"+Math.random()}
        duration={props.duration}
        containerStyle={{
          width: '100%',
          height: '100%',
          zIndex:6,
        }}
        // Inbuilt User Information in header
        userProfile={{
            userName: timestampToDate(story?.medias[0]?.modificationTime,['day']).day,
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
        onComplete={() => {
          close();
        }}
      />
    </Animated.View>
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
