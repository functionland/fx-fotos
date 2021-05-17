import React, {useEffect, createRef, useState, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { layout, FlatSection, ScrollEvent } from '../types/interfaces';
import PhotosChunk from './PhotosChunk';
import ThumbScroll from './ThumbScroll';
import { RecyclerListView, DataProvider, AutoScroll, BaseScrollView } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';
import FloatingFilters from './FloatingFilters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class ExternalScrollView extends BaseScrollView {
  private _scrollViewRef: any;

  scrollTo(...args: any[]) {
    if (this._scrollViewRef) { 
      this._scrollViewRef?.scrollTo(...args);
    }
  }
  render() {
    return <Animated.ScrollView {...this.props}
    style={{zIndex:1}}
     ref={(scrollView: any) => {this._scrollViewRef = scrollView;}}
     scrollEventThrottle={1}
     onScroll={Animated.event([(this.props as any).animatedEvent], {listener: this.props.onScroll,useNativeDriver: true})}
     />
  }
}
interface Props {
  photos: FlatSection;
  margin: Animated.AnimatedInterpolation;
  maxWidth: number;
  minWidth: number;
  numColumns: 2 | 3 | 4;
  opacity: Animated.AnimatedInterpolation;
  date: Date;
  loading: boolean;
  sortCondition: 'day' | 'month';
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
  const indicatorHeight = 50;
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return r1 !== r2;
  }));
  const [layoutProvider, setLayoutProvider] = useState<any>(LayoutUtil.getLayoutProvider(2, 'day', props.photos.headerIndexes, headerHeight, props.photos.layout));
  const [viewLoaded, setViewLoaded] = useState<boolean>(false);
  const scrollRef:any = useRef();
  const scrollRefExternal:any = useRef();
  const [lastScrollOffset, setLastScrollOffset] = useState<number>(0);
  const [layoutHeight, setLayoutHeight] = useState<number>(99999999999999);

  const [startScroll, setStartScroll] = useState<boolean>(false);
  const [endScroll, setEndScroll] = useState<boolean>(false);
  const startScrollRef = useRef(startScroll);
  startScrollRef.current = startScroll;

  const scrollY = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(new Animated.Value(2)).current; //2:is scrolling using screen slide, 1: is scrolling using thumb scroll
  const velocityY = useRef(new Animated.Value(0)).current;
  const layoutHeightAnimated = useRef(new Animated.Value(9999999999999)).current;
  const [floatingFiltersOpacity, setFloatingFiltersOpacity] = useState<number>(0);

  const [currentImageTimestamp, setCurrentImageTimestamp] = useState<number>(0);
  const dragY = useRef(new Animated.Value(0)).current;

  const [showThumbScroll, setShowThumbScroll] = useState<boolean>(false);

  useEffect(()=>{
    setDataProvider(dataProvider.cloneWithRows(props.photos.layout));
  },[props.photos]);

  useEffect(()=>{
    setLayoutProvider(LayoutUtil.getLayoutProvider(props.numColumns, props.sortCondition, props.photos.headerIndexes, headerHeight, props.photos.layout));
  },[props.numColumns, props.sortCondition]);

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
  
  const rowRenderer = (type:string | number, data:layout) => {
    //We have only one view type so not checks are needed here
    return <PhotosChunk
      photo={data}
      opacity={props.opacity}
      numCol={props.numColumns}
      loading={props.loading}
      scale={props.scale}
      //key={'PhotosChunk' + props.numColumns}
      sortCondition={props.sortCondition}
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

  const _onMomentumScrollEnd = () => {
    let lastIndex = scrollRef?.current.findApproxFirstVisibleIndex();
    props.setScrollOffset({'in':props.numColumns, 'to':lastIndex});
    console.log('momentum ended');
    let lastOffset = scrollRef?.current.getCurrentScrollOffset();
    let sampleHeight = scrollRef?.current?.getContentDimension().height;
    let lastScrollOffset = lastOffset*(SCREEN_HEIGHT-indicatorHeight)/(sampleHeight-SCREEN_HEIGHT);
    //console.log('lastScrollOffset='+lastScrollOffset+', lastOffset='+lastOffset+', sampleHeight='+sampleHeight);
    setLastScrollOffset(lastScrollOffset);
    setShowThumbScroll(false);
  }
  const _onScrollEnd = () => {
    console.log('scroll end called');
    let sampleHeight = scrollRef?.current?.getContentDimension().height;
    let lastOffset = scrollRef?.current.getCurrentScrollOffset();
    let lastScrollOffset = lastOffset*(SCREEN_HEIGHT-indicatorHeight)/(sampleHeight-SCREEN_HEIGHT);
    setLastScrollOffset(lastScrollOffset);
  }

  const scrollBarToViewSync = (value:number)=> {
    //console.log('value+lastScrollOffset='+(value+lastScrollOffset));
    let sampleHeight = scrollRef?.current?.getContentDimension().height;
    let ViewOffset = ((value+lastScrollOffset)*(sampleHeight-SCREEN_HEIGHT))/(SCREEN_HEIGHT-indicatorHeight);
    //console.log('value='+value);
    //console.log('ViewOffset='+ViewOffset);
    //console.log('sampleHeight='+sampleHeight);
    //console.log('SCREEN_HEIGHT='+SCREEN_HEIGHT);
    scrollRef.current.scrollToOffset(0, ViewOffset, false );
    let currentImageIndex = scrollRef.current.findApproxFirstVisibleIndex();
    let currentImage = props.photos.layout[currentImageIndex].value;
    let currentTimeStamp = 0;
    if(typeof currentImage === 'string'){
      currentImage = props.photos.layout[currentImageIndex+1]?.value;
      if(currentImage && typeof currentImage === 'string'){
        currentImage = props.photos.layout[currentImageIndex+2]?.value;
      }
    }
    if(currentImage && typeof currentImage !== 'string'){
      currentTimeStamp = currentImage.modificationTime;
    }
    setCurrentImageTimestamp(currentTimeStamp);
  }
  dragY.removeAllListeners();
  let animateId = dragY.addListener(({ value }) => {
    scrollBarToViewSync(value);
  });
 
  useEffect(()=>{
      setViewLoaded(true);
      //console.log("this should happen once in "+props.numColumns);
      /*scrollY.removeAllListeners();
      let animateId = scrollY.addListener(({ value }) => {
        console.log('scrollY='+value);
        setStartScroll(true);
        //UNCOMMENT//scrollBarToViewSync(value);
      });*/
  },[scrollRef, scrollRef.current]);

  const adjustScrollPosition = (newOffset:{[key:string]:(2|3|4|number)}) => {
    let numColumns:number = props.numColumns;
    if( viewLoaded && numColumns !== newOffset.in){
      scrollRef?.current?.scrollToIndex(newOffset.to, false);
    }
  }
  useEffect(()=>{
    adjustScrollPosition(props.scrollOffset);
  },[props.scrollOffset]);

  useEffect(()=>{
    if(endScroll === true){
      _onMomentumScrollEnd();
    }
  },[endScroll]);

  const _onScroll = (rawEvent: ScrollEvent, offsetX: number, offsetY: number) => {
    setShowThumbScroll(true);
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
        externalScrollView={ExternalScrollView}
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
          zIndex:1,
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
        key={"RecyclerListView_"+props.sortCondition + props.numColumns}
        scrollViewProps={{
          //ref: scrollRefExternal,
          onMomentumScrollEnd: _onMomentumScrollEnd,
          //onScrollEndDrag: _onScrollEnd,
          automaticallyAdjustContentInsets: true,
          showsVerticalScrollIndicator:false,
          animatedEvent:{nativeEvent: {contentOffset: {y: scrollY}, contentSize: {height: layoutHeightAnimated}}},
        }}
      />
      
      <ThumbScroll
        indicatorHeight={indicatorHeight}
        flexibleIndicator={false}
        shouldIndicatorHide={true}
        showThumbScroll={showThumbScroll}
        setShowThumbScroll={setShowThumbScroll}
        hideTimeout={500}
        lastOffset={lastScrollOffset}
        setLastScrollOffset={setLastScrollOffset}
        numColumns={props.numColumns}
        headerIndexes={props.photos.headerIndexes}
        numberOfPointers={props.numberOfPointers}
        headerHeight={headerHeight}
        scrollY={scrollY}
        velocityY={velocityY}
        fullSizeContentHeight={layoutHeight}
        scrollRef={scrollRef}
        setStartScroll={setStartScroll}
        setEndScroll={setEndScroll}
        startScroll={startScroll}
        scrollIndicatorContainerStyle={{}}
        scrollIndicatorStyle={{}}
        layoutHeight={layoutHeightAnimated}
        isDragging={isDragging}
        dragY={dragY}
        floatingFiltersOpacity = {floatingFiltersOpacity}
        setFloatingFiltersOpacity = {setFloatingFiltersOpacity}
        currentImageTimestamp={currentImageTimestamp}
      />
      <FloatingFilters
        headerIndexes={props.photos.headerIndexes}
        floatingFiltersOpacity={floatingFiltersOpacity}
        numColumns={props.numColumns}
        sortCondition={props.sortCondition}
        scrollRef={scrollRef}
        headerHeight={headerHeight}
        layoutHeight={layoutHeightAnimated}
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
