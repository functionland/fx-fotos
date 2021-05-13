import React, {useEffect, createRef, useState, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { flatMedia, FlatSection, ScrollEvent } from '../types/interfaces';
import PhotosChunk from './PhotosChunk';
import ThumbScroll from './ThumbScroll';
import { RecyclerListView, DataProvider, AutoScroll } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';
import { Asset } from 'expo-media-library';
import {calcLayoutHeight} from '../utils/functions';

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
  setLoadMore: Function;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const headerHeight = 20;
  const indicatorHeight = 140;
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return r1 !== r2;
  }));
  const [layoutProvider, setLayoutProvider] = useState<any>(LayoutUtil.getLayoutProvider(2, 'day', props.photos.headerIndexes, headerHeight));
  const [viewLoaded, setViewLoaded] = useState<boolean>(false);
  const scrollRef:any = useRef();
  const [lastScrollOffset, setLastScrollOffset] = useState<number>(0);
  const [layoutHeight, setLayoutHeight] = useState<number>(99999999999999);

  const scrollY = useRef(new Animated.Value(0)).current;
  const velocityY = useRef(new Animated.Value(0)).current;

  

  useEffect(()=>{
    setDataProvider(dataProvider.cloneWithRows(props.photos.layout));
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
  
  const rowRenderer = (type:string | number, data:Asset|string) => {
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
    let lastIndex = scrollRef?.current.findApproxFirstVisibleIndex();
    //console.log(lastIndex);
    props.setScrollOffset({'in':props.numColumns, 'to':lastIndex});
  }

  
  useEffect(()=>{
      setViewLoaded(true);
      console.log("this should happen once");
      let animateId = scrollY.addListener(({ value }) => {
        //console.log(scrollRef.current);
        let sampleHeight = scrollRef?.current?.getContentDimension().height;
        //console.log('-----');
        //console.log(value);
       
        let ViewOffset = ((value+lastScrollOffset)*sampleHeight)/(SCREEN_HEIGHT-indicatorHeight);
        //console.log(ViewOffset);
        
        scrollRef.current.scrollToOffset(0, ViewOffset, false );
        
    });
  },[scrollRef, scrollRef.current]);

  const adjustScrollPosition = (newOffset:{[key:string]:(2|3|4|number)}) => {
    let numColumns:number = props.numColumns;
    if( viewLoaded && numColumns !== newOffset.in){
      //let offset =newOffset.to * newOffset.in/numColumns;
      //console.log('scrolling ' + props.numColumns+ ' to '+offset);
      //scrollRef?.current.scrollToOffset(0,offset,true);
      scrollRef?.current?.scrollToIndex(newOffset.to, true);
    }
  }
  useEffect(()=>{
    adjustScrollPosition(props.scrollOffset);
  },[props.scrollOffset]);

  const _onScroll = (rawEvent: ScrollEvent, offsetX: number, offsetY: number) => {
    if(layoutHeight===99999999999999){
      let sampleHeight = scrollRef?.current?.getContentDimension();
      if(sampleHeight.height!==0){
        setLayoutHeight(sampleHeight.height);
      }
    }
    let adjustedOffset = (offsetY * SCREEN_HEIGHT)/layoutHeight;

    setLastScrollOffset(adjustedOffset*((SCREEN_HEIGHT-indicatorHeight)/SCREEN_HEIGHT));
  }

  return props.photos.layout ? (
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
        onEndReached={() => props.setLoadMore(new Date().getTime())}
        onEndReachedThreshold={0.4}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
        renderFooter={renderFooter}
        scrollEnabled={!props.isPinchAndZoom}
        onScroll={_onScroll}
        key={"RecyclerListView_"+props.separator + props.numColumns}
        scrollViewProps={{
          //ref: scrollRefInternal,
          onMomentumScrollEnd: onScrollEnd,
          automaticallyAdjustContentInsets: true,

        }}
      />
      <ThumbScroll
        indicatorHeight={indicatorHeight}
        flexibleIndicator={false}
        shouldIndicatorHide={false}
        hideTimeout={500}
        lastOffset={lastScrollOffset}
        setLastOffset={setLastScrollOffset}
        numColumns={props.numColumns}
        headerIndexes={props.photos.headerIndexes}
        numberOfPointers={props.numberOfPointers}
        headerHeight={headerHeight}
        scrollY={scrollY}
        velocityY={velocityY}
        fullSizeContentHeight={layoutHeight}
        scrollRef={scrollRef}
        scrollIndicatorContainerStyle={{}}
        scrollIndicatorStyle={{}}
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
