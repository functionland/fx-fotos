import {Asset} from 'expo-media-library';
import React, {createRef, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  StyleSheet,
} from 'react-native';
import {layout} from '../types/interfaces';
import {prettyTime} from '../utils/functions';
import {MaterialIcons} from '@expo/vector-icons';
import RoundCheckbox from './RoundCheckbox';
import {
  HandlerStateChangeEvent,
  LongPressGestureHandler,
  State,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

const isIOS = Platform.OS === 'ios';
interface Props {
  photo: layout;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  loading: boolean;
  scale: Animated.Value;
  sortCondition: 'day' | 'month';
  index: number;
  modalShown: boolean;
  setModalShown: (newVal: boolean) => void;
  setSinglePhotoIndex: (index: number) => void;
  setImagePosition: (newPos: {x: number; y: number}) => void;
  headerHeight: number;
  onMediaLongTap: Function;
  showSelectionCheckbox: boolean;
  selectedAssets:Asset[]|undefined;
}

const PhotosChunk: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const [imageRef, setImageRef] = useState<Image | null>();
  const tempScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 0,
      });
    }
  }, [imageRef]);

  const handleOnLoad = () => {
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 1,
      });
    }
  };

  const _onSingleTapHandlerStateChange = (
    event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>,
  ) => {
    if (event.nativeEvent.state === State.BEGAN) {
      console.log('TAP state BEGAN');
      Animated.timing(tempScale, {
        toValue: 0.8,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }

    if (
      event.nativeEvent.state === State.ACTIVE &&
      event.nativeEvent.oldState !== State.ACTIVE
    ) {
      if(!props.showSelectionCheckbox){
        let imageOffsetY = event.nativeEvent.absoluteY - event.nativeEvent.y;
        let imageOffsetX = event.nativeEvent.absoluteX - event.nativeEvent.x;
        props.setImagePosition({x: imageOffsetX, y: imageOffsetY});
        props.setSinglePhotoIndex(props.index);
        props.setModalShown(true);
      }else{
        props.onMediaLongTap(props.photo.value);
      }
      Animated.timing(tempScale, {
        toValue: 1,
        useNativeDriver: true,
      }).stop();
      tempScale.setValue(1);
    } else if (
      event.nativeEvent.state === State.CANCELLED ||
      event.nativeEvent.state === State.FAILED
    ) {
      Animated.timing(tempScale, {
        toValue: 1,
        useNativeDriver: true,
      }).stop();
      tempScale.setValue(1);
    }
  };
  const _onLongTapHandlerStateChange = (
    event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>,
  ) => {
    if (
      event.nativeEvent.state === State.ACTIVE &&
      event.nativeEvent.oldState !== State.ACTIVE
    ) {
      if(typeof props.photo.value !== 'string'){
        props.onMediaLongTap(props.photo.value);
      }

    }
  };
  const longTapRef = createRef<LongPressGestureHandler>();
  const singleTapRef = createRef<TapGestureHandler>();

  const createThumbnail = (media: Asset) => {
    if (media.duration > 0) {
      return (
        <View
          style={{
            height: SCREEN_WIDTH / props.numCol,
            width: SCREEN_WIDTH / props.numCol,
          }}>
          <Animated.Image
            ref={(ref: React.SetStateAction<Image | null | undefined>) => {
              setImageRef(ref);
            }}
            source={{uri: media.uri}}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              height: SCREEN_WIDTH / props.numCol - 2.5,
              width: SCREEN_WIDTH / props.numCol - 2.5,
              backgroundColor: props.loading ? 'grey' : 'white',
              margin: 2.5,
              zIndex: 4,
            }}
            key={media.uri}
            onLoad={handleOnLoad}
          />
          <View style={styles.videoText}>
            <Text style={styles.durationText}>
              {prettyTime(media.duration)}
            </Text>
            <MaterialIcons name="play-circle-filled" size={20} color="white" />
          </View>
        </View>
      );
    } else {
      return (
        <Animated.Image
          ref={(ref: React.SetStateAction<Image | null | undefined>) => {
            setImageRef(ref);
          }}
          source={{uri: media.uri}}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            height: SCREEN_WIDTH / props.numCol - 2.5,
            width: SCREEN_WIDTH / props.numCol - 2.5,
            backgroundColor: props.loading ? 'grey' : 'white',
            margin: 2.5,
            zIndex: 4,
          }}
          key={media.uri}
          onLoad={handleOnLoad}
        />
      );
    }
  };

  if (
    props.photo.sortCondition === props.sortCondition ||
    props.photo.sortCondition === ''
  ) {
    if (typeof props.photo.value === 'string') {
      return (
        <View style={{flex: 1, width: SCREEN_WIDTH}}>
          <Text>{props.photo.value}</Text>
        </View>
      );
    } else {
      return (

        <Animated.View
          style={{
            zIndex: 4,
            flex: 1 / props.numCol,
            width: SCREEN_WIDTH / props.numCol,
            height: SCREEN_WIDTH / props.numCol,
            transform: [
              {
                scale: tempScale,
              },
            ],
          }}>
          <LongPressGestureHandler
            ref={longTapRef}
            onHandlerStateChange={_onLongTapHandlerStateChange}
            minDurationMs={800}>
            <TapGestureHandler
              ref={singleTapRef}
              onHandlerStateChange={_onSingleTapHandlerStateChange}
              numberOfTaps={1}>
              {createThumbnail(props.photo.value)}
            </TapGestureHandler>
          </LongPressGestureHandler>
          <View style={[
              styles.checkBox, 
              {
                opacity:props.showSelectionCheckbox?1:0
              }
            ]}
          >
          <RoundCheckbox 
            size={24}
            checked={props.selectedAssets?.findIndex(x=>(typeof props.photo.value!=='string' && x.id===props.photo.value.id))===-1?false:true}
            borderColor='whitesmoke'
          />
          </View>
        </Animated.View>
      );
    }
  } else {
    return <View style={{height: 0, width: 0}} />;
  }
};
const styles = StyleSheet.create({
  durationText: {
    color: 'whitesmoke',
    position: 'relative',
    marginRight: 5,
  },
  videoText: {
    zIndex: 4,
    height: 20,
    position: 'absolute',
    top: 5,
    right: 5,
    flex: 1,

    flexDirection: 'row',
  },
  checkBox:{
    zIndex:4,
    position: 'absolute',
    top:5,
    left: 5,
    flex: 1,
    flexDirection:'row',
    color: 'white',
  }
});
export default PhotosChunk;
