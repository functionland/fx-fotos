import { Asset } from 'expo-media-library';
import React, {useEffect, useRef, useState, createRef} from 'react';
import { View, SafeAreaView, useWindowDimensions, StyleSheet, Image } from 'react-native';
import StoryContainer from './Story/stories/StoryContainer';

import {
  BAR_ACTIVE_COLOR,
  BAR_INACTIVE_COLOR,
} from './Story/utils/colors';

import {
  PanGestureHandler,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import { calcImageDimension, } from '../utils/functions';

interface Props {
  medias:Asset[]|undefined;
  duration: number;
  numColumns: 2|3|4;
  text?: string | undefined;
}

const Highlights: React.FC<Props> = (props) => {
  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {isMounted.current = false;}
  }, []);
  const [showStory, setShowStory] = useState<boolean>(false);
  const [images, setImages] = useState<Asset[]>([]);

  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
  const panRef = createRef<PanGestureHandler>();

  const openHighlights = (medias:Asset[]) => {
    setImages(medias);
    console.log('here');
    setShowStory(true);
  }

  const _onPanHandlerStateChange = ( event:HandlerStateChangeEvent<PanGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.state === State.END){
      if(props.medias){
        openHighlights(props.medias);
      }
    }
  }

  return props.medias ? (
    <PanGestureHandler
      maxPointers={1}
      ref={panRef}
      onHandlerStateChange={_onPanHandlerStateChange}
    >
      <View 
        style= {[
          styles.container, 
          {
            width: SCREEN_WIDTH/3,
            height: 1.618*SCREEN_WIDTH/3
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
            {uri: props.medias[0]?.uri}
          }
        />
        <View style={
          {
            flex: 1, 
            flexDirection: 'column', 
            position: 'absolute', 
            top:0, 
            left:0, 
            opacity:showStory?1:0,
            width:showStory?SCREEN_WIDTH:0,
            height:showStory?SCREEN_HEIGHT:0,
            zIndex:5,
            backgroundColor:'black'
          }
        }>
          {/* Individual Story View component */}
          <StoryContainer
            visible={showStory}
            enableProgress={true}
            images={images}
            id={"Story_"+props.numColumns}
            duration={5}
            containerStyle={{
              width: '100%',
              height: '100%',
              zIndex:6,
            }}
            // Inbuilt User Information in header
            userProfile={{
              
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
            onComplete={() => setShowStory(false)}
          />
        </View>
      </View>
    </PanGestureHandler>
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

export default Highlights;
