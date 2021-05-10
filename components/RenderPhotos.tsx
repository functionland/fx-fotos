import React, {useEffect, createRef, useState, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Text,
  StyleSheet,
  StatusBar,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { flatMedia, FlatSection, ScrollEvent } from '../types/interfaces';
import PhotosChunk from './PhotosChunk';
import { RecyclerListView, DataProvider, AutoScroll } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';
import { Asset } from 'expo-media-library';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  photos: FlatSection;
  margin: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  numColumns: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  loading: boolean;
  separator: 'day' | 'month';
  zIndex: number;
  scale: Animated.Value;
  sizeTransformScale: Animated.AnimatedInterpolation;
  isPinchAndZoom: boolean;
  scrollOffset:{[key:number]:number};
  setScrollOffset: Function;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return r1 !== r2;
  }));
  const [layoutProvider, setLayoutProvider] = useState<any>(LayoutUtil.getLayoutProvider(2, 'day', props.photos.headerIndexes));
  const [baseOffset, setBaseOffset] = useState<number>(0);
  const scrollRef:any = useRef();
  const scrollRefInternal:any = useRef();

  useEffect(()=>{
    setDataProvider(dataProvider.cloneWithRows(props.photos.flatMedias));
  },[props.photos]);
  useEffect(()=>{
    setLayoutProvider(LayoutUtil.getLayoutProvider(props.numColumns, props.separator, props.photos.headerIndexes));
  },[props.numColumns, props.separator]);

  const renderFooter = () => {
    //Second view makes sure we don't unnecessarily change height of the list on this event. That might cause indicator to remain invisible
    //The empty view can be removed once you've fetched all the data
    return (false)
      ? <ActivityIndicator
          style={{ margin: 10 }}
          size="large"
          color={'black'}
        />
      : <></>;
  };
  
  const rowRenderer = (type:string | number, data:flatMedia) => {
    //We have only one view type so not checks are needed here
    return <PhotosChunk
      photo={data}
      opacity={props.opacity}
      numCol={props.numColumns}
      loading={props.loading}
      scale={props.scale}
      key={'PhotosChunk' + props.numColumns}
    />;
  };

  
  const scrollToLocation = (offset:number) => {
      if(scrollRef){
        //scrollRef.current?.scrollToOffset(0, offset, true);
        AutoScroll.scrollNow(scrollRef.current, 0, 0, 0, offset, 1).then(()=>{
          console.log("scroll done");
        }).catch(e=>console.log(e));
      }
  }

  const onScrollEnd = () => {
    let lastOffset = scrollRef?.current.getCurrentScrollOffset();
    props.setScrollOffset({'in':props.numColumns, 'to':lastOffset});
  }
  useEffect(()=>{
      scrollRef?.current.scrollToOffset(0,1000,true);
      if(props.numColumns===2){
        console.log('here');
      //scrollToLocation(1000);
      }
    
  },[scrollRef, scrollRef.current]);

  const adjustScrollPosition = (newOffset:{[key:string]:(2|3|4|number)}) => {
    let numColumns:number = props.numColumns;
    if( numColumns !== newOffset.in){
      let offset =newOffset.to * newOffset.in/numColumns;
      console.log('scrolling ' + props.numColumns+ ' to '+offset);
      scrollRef?.current.scrollToOffset(0,offset,true);
    }
  }
  useEffect(()=>{
    adjustScrollPosition(props.scrollOffset);
  },[props.scrollOffset]);

  return props.photos.flatMedias ? (
    <Animated.View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        opacity: props.opacity,
        zIndex: props.zIndex,
        transform: [
          {
            scale: props.sizeTransformScale
          },
          {
            translateX: Animated.divide(
              Animated.subtract(
                Animated.multiply(
                  props.sizeTransformScale,SCREEN_WIDTH), 
                SCREEN_WIDTH)
              , Animated.multiply(2,props.sizeTransformScale))
          },
          {
            translateY: Animated.divide(
              Animated.subtract(
                Animated.multiply(
                  props.sizeTransformScale,(SCREEN_HEIGHT-(StatusBar.currentHeight || 0))
                ), (SCREEN_HEIGHT-(StatusBar.currentHeight || 0))
              )
              , Animated.multiply(2,props.sizeTransformScale))
          }
        ],
      }}
    >
      <RecyclerListView
        ref={scrollRef}
        style={{
          flex: 1,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: 'absolute',
          top: 0,
          bottom: 0,
          marginTop: 0,
          right: 0,
          left: 0,
        }}
        contentContainerStyle={{ margin: 0 }}
        onEndReached={() => console.log('getting photo')}
        onEndReachedThreshold={0.6}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
        renderFooter={renderFooter}
        scrollEnabled={!props.isPinchAndZoom}
        key={"RecyclerListView_"+props.separator + props.numColumns}
        scrollViewProps={{
          //ref: scrollRefInternal,
          onMomentumScrollEnd: onScrollEnd
        }}
      />
    </Animated.View>
  ) : (
    <Animated.View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        bottom: 0,
        marginTop: StatusBar.currentHeight || 0,
        right: 0,
        left: 0,
        opacity: props.opacity,
      }}>
      <Text>Loading...</Text>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    backgroundColor: '#fff',
  },
});
export default RenderPhotos;
