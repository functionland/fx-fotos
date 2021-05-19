import {Asset} from 'expo-media-library';
import React, {useEffect, useState, createRef} from 'react';
import {Animated, Image, Text, StyleSheet, Dimensions, View, Platform} from 'react-native';
import { layout } from '../types/interfaces';
import {
  LongPressGestureHandler,
  TapGestureHandler,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const isIOS = Platform.OS === 'ios';
interface Props {
  photo: layout;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  loading: boolean;
  scale: Animated.Value;
  sortCondition: 'day'|'month';
  index: number;
  modalShown: boolean;
  setModalShown: Function;
  setSinglePhotoIndex: Function;
  setImagePosition: Function;
}


const PhotosChunk: React.FC<Props> = (props) => {
  const [imageRef, setImageRef] = useState<Image | null>();

  useEffect(()=>{
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 0,
      });
    }
  },[imageRef,isIOS]);
  const handleOnLoad = () => {
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 1,
      });
    }
  };


  const _onSingleTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState !== State.ACTIVE && event.nativeEvent.state === State.ACTIVE) {
      let imageOffsetY = event.nativeEvent.absoluteY - event.nativeEvent.y;
      let imageOffsetX = event.nativeEvent.absoluteX - event.nativeEvent.x;

      props.setImagePosition({x:imageOffsetX, y:imageOffsetY});
      props.setSinglePhotoIndex(props.index);
      props.setModalShown(true);
    }
  }
  const _onLongTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      console.log('long tap');
    }
  }
  const longTapRef = createRef();
  const singleTapRef = createRef();
  
  if(props.photo.sortCondition === props.sortCondition || props.photo.sortCondition === ""){
    if(typeof props.photo.value === 'string'){
      return (
        <View style={{flex: 1, width: SCREEN_WIDTH,}}>
          <Text>{props.photo.value}</Text>
        </View>
      )
    }else{
      return (
        <Animated.View style={{
          zIndex:4, 
          flex: 1/props.numCol, 
          width: SCREEN_WIDTH/props.numCol,
        }}>
        <LongPressGestureHandler
        ref={longTapRef}
          onHandlerStateChange={_onLongTapHandlerStateChange}
          minDurationMs={800}
        >
        <TapGestureHandler
          ref={singleTapRef}
          onHandlerStateChange={_onSingleTapHandlerStateChange}
          numberOfTaps={1}
        >
            <Animated.Image
              ref={(ref: React.SetStateAction<Image | null | undefined>) => {
                setImageRef(ref);
              }}
              source={{uri: props.photo.value.uri}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: SCREEN_WIDTH / props.numCol,
                width: SCREEN_WIDTH / props.numCol,
                backgroundColor: props.loading ? 'grey' : 'white',
                margin: 1,
                zIndex:4,
              }}
              key={props.photo.value.uri}
              onLoad={handleOnLoad}
            />
          </TapGestureHandler>
        </LongPressGestureHandler>
        </Animated.View>
      );
    }
  }else{
    return (
      <View style={{height:0, width:0}}></View>
    )
  }
};
const styles = StyleSheet.create({
  
});
export default PhotosChunk;
