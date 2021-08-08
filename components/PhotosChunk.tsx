import {Asset} from 'expo-media-library';
import React, {createRef, useRef, useEffect} from 'react';
import { Image, Text, StyleSheet, Animated, View } from 'react-native';
import { layout } from '../types/interfaces';
import { prettyTime } from '../utils/functions';
import { MaterialIcons } from '@expo/vector-icons'; 
import RoundCheckbox from './RoundCheckbox';

import {
  LongPressGestureHandler,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  LongPressGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { default as Reanimated, useAnimatedGestureHandler, runOnJS, } from 'react-native-reanimated';

interface Props {
  photo: layout;
  index: number;
  modalShown: Reanimated.SharedValue<number>;
  headerShown: Reanimated.SharedValue<number>;
  headerHeight: number;
  animatedImagePositionX: Reanimated.SharedValue<number>;
  animatedImagePositionY: Reanimated.SharedValue<number>;
  animatedSingleMediaIndex: Reanimated.SharedValue<number>;
  singleImageWidth: Reanimated.SharedValue<number>;
  singleImageHeight: Reanimated.SharedValue<number>;
  selectedAssets: Reanimated.SharedValue<string[]>
  imageWidth: number;
  imageHeight: number;

  lastSelectedAssetId: Reanimated.SharedValue<string>;
  lastSelectedAssetAction: Reanimated.SharedValue<number>;
	selectedAssetsRef:React.MutableRefObject<string[]>;
  clearSelection: Animated.Value;

	uploadedAssets: React.MutableRefObject<{[key: string]: number;}>;
	lastUpload: Reanimated.SharedValue<string>;
	uploadingPercent: Animated.Value;

  SCREEN_HEIGHT: number;
  SCREEN_WIDTH: number;
}


const PhotosChunk: React.FC<Props> = (props) => {
  const loading = false;
  const longTapRef = createRef<LongPressGestureHandler>();
  const singleTapRef = createRef<TapGestureHandler>();

  const selected = useRef(new Animated.Value(0)).current;
  const selectedOpacity = useRef(Animated.multiply(selected, props.clearSelection)).current;
  const animatedTempScale = useRef(new Animated.Value(1)).current;
  const setAnimatedSelectedVal = (val:number, index:number=-1) => {
    selected.setValue(val);
		if(index>-1 && val===0){
			props.selectedAssetsRef.current.splice(index, 1);
			props.selectedAssets.value.splice(index, 1);
      props.lastSelectedAssetAction.value = 0;
			props.lastSelectedAssetId.value = props.photo.id;
		}
  }

	const notUploaded = useRef(new Animated.Value(1)).current;
	if(props.uploadedAssets.current.hasOwnProperty(props.photo.id)){
		notUploaded.setValue(0);
	}
  const selectionScale = useRef(new Animated.Value(1)).current;

	const changeSelection = (selected:number = 1) => {
		let index = props.selectedAssetsRef.current.findIndex(x=>x===props.photo.id);
    if(index>-1){
      setAnimatedSelectedVal(selected, index);
    }else{
      setAnimatedSelectedVal(0);
    }
	}
	useEffect(()=>{
		props.uploadingPercent.addListener(({value})=>{
			console.log('value changed to '+value);
			if(value>0){
				notUploaded.setValue(0);
				changeSelection(0);
				selected.setValue(0);
			}
		})

		return ()=>{props.uploadingPercent.removeAllListeners();}
	}, []);

  Animated.timing(selectionScale, {
    toValue: selectedOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.9],
    }),
    duration: 300,
    useNativeDriver: true,
  }).start();
	
  useEffect(()=>{
    changeSelection();
  },[props.photo.id])

  const _onTapGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent, {}>({
    onActive: (event)=>{
      console.log('onActive');
      if(props.selectedAssets.value.length===0){
        props.animatedImagePositionY.value = event.absoluteY - event.y;
        props.animatedImagePositionX.value = event.absoluteX - event.x;
        props.animatedSingleMediaIndex.value = props.index;
        const ratio = props.imageHeight/props.imageWidth;
        const screenRatio = props.SCREEN_HEIGHT/props.SCREEN_WIDTH;
        let height = props.SCREEN_HEIGHT;
        let width = props.SCREEN_WIDTH;
        if(ratio > screenRatio){
          width = props.SCREEN_HEIGHT/screenRatio;
        }else{
          height = props.SCREEN_WIDTH*screenRatio;
        }
        props.singleImageHeight.value = height;
        props.singleImageWidth.value = width;
        console.log('Opening modal');
        
        props.headerShown.value = 0;
        props.modalShown.value = 1;
      }else{
        let index = props.selectedAssets.value.findIndex(x=>x===props.photo.id);
        props.lastSelectedAssetId.value = props.photo.id;
        if(index > -1){
          props.selectedAssets.value.splice(index, 1);
          props.lastSelectedAssetAction.value = 0;
          runOnJS(setAnimatedSelectedVal)(0);
        }else{
          props.selectedAssets.value.push(props.photo.id);
          props.lastSelectedAssetAction.value = 1;
          runOnJS(setAnimatedSelectedVal)(1);
        }
      }

      /*Animated.timing(animatedTempScale, {
        duration: 10,
        toValue: 1,
        useNativeDriver: true
      }).start();*/
    },
  });

  const _onLongGestureEvent = useAnimatedGestureHandler<LongPressGestureHandlerGestureEvent, {time:number, absoluteX:number}>({
    onActive: (event, ctx)=>{
			const timeDiff = new Date().getTime() - ctx.time;
			console.log('onLongActive');
			console.log(timeDiff);
			if(timeDiff > 500 || ctx.absoluteX !== event.absoluteX){
				ctx.absoluteX = event.absoluteX;
				ctx.time = new Date().getTime();
				let index = props.selectedAssets.value.findIndex(x=>x===props.photo.id);
				props.lastSelectedAssetId.value = props.photo.id;
				if(index > -1){
					//console.log('removed '+index);
					props.selectedAssets.value.splice(index, 1);
					props.lastSelectedAssetAction.value = 0;
					runOnJS(setAnimatedSelectedVal)(0);
				}else{
					console.log('added '+index);
					props.selectedAssets.value.push(props.photo.id);
					props.lastSelectedAssetAction.value = 1;
					runOnJS(setAnimatedSelectedVal)(1);
				}
			}else{
				ctx.time = new Date().getTime();
				ctx.absoluteX = event.absoluteX;
			}
    },
  });

  const createThumbnail = (media:Asset) => {
		return (
			<>
    {(media.duration > 0)? 
      (
        <>
          <Image
              source={{uri: media.uri}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flex: 1,
                backgroundColor: loading ? 'grey' : 'white',
                margin: 2.5,
                zIndex: 4,
              }}
          />
          <View 
            style={styles.videoText}
          >
            <Text style={styles.durationText}>{prettyTime(media.duration)}</Text>
            <MaterialIcons name="play-circle-filled" size={20} color="white" />
          </View>
        </>
      )
    	:
      (
        <Image
              source={{uri: media.uri}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flex: 1,
                backgroundColor: 'grey',
                margin: 2.5,
                zIndex:4,
              }}
        />
      )
		}
		</>
		)
  }
		
  
    if(typeof props.photo.value === 'string'){
      return (
        <View style={{flex: 1, width: props.SCREEN_WIDTH,}}>
          <Text>{props.photo.value}</Text>
        </View>
      )
    }else{
      return (
        <Animated.View style={[{
          zIndex:4, 
          flex: 1,
          opacity: animatedTempScale,
          transform: [
            {
              scale: selectionScale
            }
          ]
        }]}>
        <LongPressGestureHandler
          ref={longTapRef}
          onGestureEvent={_onLongGestureEvent}
          minDurationMs={400}
        >
          <Reanimated.View 
            style={{
              flex: 1,
              zIndex:5
            }}>
            <TapGestureHandler
              ref={singleTapRef}
              onGestureEvent={_onTapGestureEvent}
            >
              <Reanimated.View
                style={{
                  flex: 1,
                }}
              >
                 {createThumbnail(props.photo.value)}
              </Reanimated.View>
            </TapGestureHandler>
          </Reanimated.View>
        </LongPressGestureHandler>
        <Animated.View style={
          [
            styles.checkBox, 
            {
              opacity: selectedOpacity
            }
          ]
        } >
          <RoundCheckbox 
            size={24}
            checked={selectedOpacity}
            borderColor='whitesmoke'
            icon='check'
            backgroundColor='#007AFF'
            iconColor='white'
            onValueChange={() => {}}
          />
          </Animated.View>
					<Animated.View 
						style={[
							styles.uploadStatus,
							{
								opacity: notUploaded
							}
						]}
					>
						<MaterialIcons name="cloud-off" size={20} color="white" />
					</Animated.View>
        </Animated.View>

      );
    }
};
const styles = StyleSheet.create({
  durationText:{
    color: 'whitesmoke',
    position: 'relative',
    marginRight:5
  },
  videoText: {
    zIndex:4,
    height: 20,
    position: 'absolute',
    top:5,
    right: 5,
    flex: 1,
    flexDirection:'row',
  },
	uploadStatus: {
    zIndex:5,
    height: 20,
    position: 'absolute',
    bottom:5,
    left: 5,
    flex: 1,
    flexDirection:'row',
		color: 'white',
  },
  checkBox:{
    zIndex:5,
    position: 'absolute',
    top:-5,
    left: -5,
    flex: 1,
    flexDirection:'row',
    color: 'white',
  }
});

const isEqual = (prevProps:Props, nextProps:Props) => {
  return (prevProps.photo.id === nextProps.photo.id && prevProps.index===nextProps.index);
}
export default React.memo(PhotosChunk, isEqual);
