import React, {useEffect, MutableRefObject, useState, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  View,
  FlatList,
  SafeAreaView,
  ScrollView,
  Systrace
} from 'react-native';
import { layout, FlatSection, ScrollEvent, story,  } from '../types/interfaces';
import PhotosChunk from './PhotosChunk';
import ThumbScroll from './ThumbScroll';
import Highlights from './Highlights';
import { RecyclerListView, DataProvider, AutoScroll, BaseScrollView, LayoutProvider } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';
import FloatingFilters from './FloatingFilters';
import { useBackHandler } from '@react-native-community/hooks'
import { Asset } from 'expo-media-library';
import {default as Reanimated, useSharedValue, useAnimatedRef, useDerivedValue, scrollTo as reanimatedScrollTo, useAnimatedScrollHandler} from 'react-native-reanimated';


import {
  useRecoilState,
} from 'recoil';
import {storiesState} from '../states';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class ExternalScrollView extends BaseScrollView {
  scrollTo(...args: any[]) {
    //if ((this.props as any).scrollRefExternal?.current) { 
      (this.props as any).scrollRefExternal?.current?.scrollTo(...args);
      //reanimatedScrollTo((this.props as any).scrollRefExternal, 0, args[0].y, true);
      //(this.props as any).scroll.value = args[0].y;
    //}
  }
  render() {
    return (
      <Reanimated.ScrollView {...this.props}
        style={{zIndex:1}}
        ref={(this.props as any).scrollRefExternal}
        scrollEventThrottle={16}
        nestedScrollEnabled = {true}
        //onScroll={(this.props as any)._onScrollExternal}
        //onScroll={Reanimated.event([(this.props as any).animatedEvent], {listener: this.props.onScroll, useNativeDriver: true})}
      >
        {this.props.children}
      </Reanimated.ScrollView>
    );
  }
}
interface Props {
  photos: FlatSection;
  maxWidth: number;
  minWidth: number;
  numColumns: 2 | 3 | 4;
  loading: boolean;
  sortCondition: 'day' | 'month';
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
  scrollIndex2:Animated.Value;
  scrollIndex3:Animated.Value;
  scrollIndex4:Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  modalShown: Animated.Value;
  headerShown: Reanimated.SharedValue<number>;
  setImagePosition: Function;
  storiesHeight: number;
  showStory:Animated.Value;
  scrollY: Reanimated.SharedValue<number>;
  HEADER_HEIGHT: number;
  onMediaLongTap: Function;
  showSelectionCheckbox:boolean;
  selectedAssets:Asset[]|undefined;
}

const RenderPhotos: React.FC<Props> = (props) => {
  const [stories, setStories] = useRecoilState(storiesState);
  const headerHeight = 20;
  const indicatorHeight = 50;
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return (typeof r1.value==='string' && typeof r2.value==='string')?(r1.value !== r2.value):((r1.index !== r2.index) || r1.selected !== r2.selected);
  }));
  const [layoutProvider, setLayoutProvider] = useState<LayoutProvider>(LayoutUtil.getLayoutProvider(2, 'day', headerHeight, [], props.storiesHeight, props.HEADER_HEIGHT));
  layoutProvider.shouldRefreshWithAnchoring = true;
  const [viewLoaded, setViewLoaded] = useState<boolean>(false);
  const scrollRef:any = useRef();
  const scrollRefExternal = useAnimatedRef<Reanimated.ScrollView>();
  const scroll = useSharedValue(0);

  useDerivedValue(() => {
    console.log('reanimatedScrollTo '+scroll.value);
    reanimatedScrollTo(scrollRefExternal, 0, scroll.value, false);
  });
 
  const [lastScrollOffset, setLastScrollOffset] = useState<number>(0);
  const [startScroll, setStartScroll] = useState<boolean>(false);
  const [endScroll, setEndScroll] = useState<boolean>(false);
  const startScrollRef = useRef(startScroll);
  startScrollRef.current = startScroll;

  const isDragging = useRef(new Animated.Value(2)).current; //2:is scrolling using screen slide, 1: is scrolling using thumb scroll
  const velocityY = useRef(new Animated.Value(0)).current;
  const layoutHeightAnimated = useSharedValue(99999999);
  const [floatingFiltersOpacity, setFloatingFiltersOpacity] = useState<number>(0);

  const [currentImageTimestamp, setCurrentImageTimestamp] = useState<number>(0);
  const dragY = useRef(new Animated.Value(0)).current;

  const [showThumbScroll, setShowThumbScroll] = useState<boolean>(false);
  const opacity = props.scale.value;
  const animatedStyle = Reanimated.useAnimatedStyle(()=>{
    return {
         opacity: (props.numColumnsAnimated.value===props.numColumns)?(Reanimated.interpolate(
            props.scale.value,
            [0,1,4],
            [0,1,0]
         )):(props.numColumnsAnimated.value===(props.numColumns-1)?(Reanimated.interpolate(
              props.scale.value,
              [0, 1, 4],
              [1, 0, 0]
          )):(props.numColumnsAnimated.value===(props.numColumns+1)?(Reanimated.interpolate(
              props.scale.value,
              [0, 1, 4],
              [0, 0, 1]
            )):(0))),
         zIndex:(props.numColumnsAnimated.value===props.numColumns)?1:0,
         transform: [
          {
            scale: Reanimated.interpolate(
              props.scale.value,
              [0, 1, 4],
              [(props.numColumnsAnimated.value/props.numColumnsAnimated.value-1), 1, (props.numColumnsAnimated.value/props.numColumnsAnimated.value+1)]
           ),
          },
          {
            translateX: (
              (
                (
                  props.scale.value*SCREEN_WIDTH)- 
                SCREEN_WIDTH)
              / (2*props.scale.value))
          },
          {
            translateY: (
              (
                (
                  props.scale.value*(SCREEN_HEIGHT-(StatusBar.currentHeight || 0))
                ) - (SCREEN_HEIGHT-(StatusBar.currentHeight || 0))
              )
              / (2*props.scale.value))
          }
        ],
      };
});

  useEffect(()=>{
    console.log([Date.now()+': component RenderPhotos'+props.numColumns+' rendered']);
  });


  //scrollRefExternal?.current?.scrollTo({x:0,y:100});

  useEffect(()=>{
    console.log(['component RenderPhotos mounted']);
    return () => {
      console.log(['component RenderPhotos unmounted']);
    }
  }, []);
  useEffect(()=>{
    console.log('photos.layout length changed');
    if(dataProvider.getAllData().length !== props.photos.layout.length){
    let data = props.photos.layout;
    setLayoutProvider(LayoutUtil.getLayoutProvider(props.numColumns, props.sortCondition, headerHeight, data, props.storiesHeight, props.HEADER_HEIGHT));
    //setDataProvider(dataProvider.cloneWithRows(dataProvider.getAllData().concat(props.photos.layout),(dataProvider.getAllData().length>0?dataProvider.getAllData().length-1:undefined)));
    setDataProvider(dataProvider.cloneWithRows(props.photos.layout));
    }
  },[props.photos.layout.length]);

  useBackHandler(() => {
    if (props.showSelectionCheckbox) {
      props.onMediaLongTap(undefined);
      return true
    }
    // let the default thing happen
    return false
  })
  
  const rowRenderer = (type:string | number, data:layout, index: number) => {
    switch(type){
      case 'story':
        return (
          <SafeAreaView  style={{position:'relative', zIndex:1,marginTop:2*props.HEADER_HEIGHT}}>
            <FlatList 
              data={stories}
              horizontal={true}
              keyExtractor={(item:story, index:number) => 'StoryItem_'+index+'_'+item.text}
              getItemLayout={(data, index) => {
                return {
                  length: 15+props.storiesHeight/1.618, 
                  offset: index*(15+props.storiesHeight/1.618), 
                  index: index
                }
              }}
              showsHorizontalScrollIndicator={false}
              renderItem={( {item} ) => (
                <View style={{width:15+props.storiesHeight/1.618,height:props.storiesHeight+25}}>
                <Highlights
                  story={item}
                  duration={1500}
                  numColumns={props.numColumns}
                  height={props.storiesHeight}
                  showStory={props.showStory}
                  headerShown={props.headerShown}
                />
                </View>
              )}
            />
          </SafeAreaView>
        );
      break;
      default:
    return (
    <View style={{position:'relative', zIndex:1}}>
      <PhotosChunk
        photo={data}
        numCol={props.numColumns}
        key={'PhotosChunk_col' + props.numColumns + '_id' + index}
        index={data.index}
        sortCondition={props.sortCondition}
        modalShown={props.modalShown}
        headerShown={props.headerShown}
        setImagePosition={props.setImagePosition}
        headerHeight={headerHeight}
        onMediaLongTap={props.onMediaLongTap}
        showSelectionCheckbox={props.showSelectionCheckbox}
        selectedAssets={props.selectedAssets}
      />
    </View>);
    }
  };

  
  const scrollToLocation = (offset:number) => {
      if(scrollRef){
        //scrollRef.current?.scrollToOffset(0, offset, true);
        AutoScroll.scrollNow(scrollRef.current, 0, 0, 0, offset, 1).then(()=>{
          ////console.log("scroll done");
        }).catch(e=>console.log(e));
      }
  }

  useEffect(()=>{
    console.log('props. numColumn='+props.numColumns);
  if(props.numColumns===2){
    props.scrollIndex4.removeAllListeners();
    props.scrollIndex4.addListener(({value})=>{
      scrollRef?.current?.scrollToIndex(value, false);
    });
  }else if(props.numColumns===3){
    props.scrollIndex2.removeAllListeners();
    props.scrollIndex2.addListener(({value})=>{
      console.log('scrollIndex2 changed in numColumns 3 to '+value);
      scrollRef?.current?.scrollToIndex(value, false);
    });
  }else if(props.numColumns===4){
    
  }
  },[props.numColumns, scrollRef?.current]);

  const _onMomentumScrollEnd = () => {
      let lastIndex = scrollRef?.current.findApproxFirstVisibleIndex();
      if(props.numColumns===2){
        console.log('last index is '+lastIndex);
        props.scrollIndex2.setValue(lastIndex);
      }else if(props.numColumns===3){
        props.scrollIndex3.setValue(lastIndex);
      }else if(props.numColumns===4){
        props.scrollIndex4.setValue(lastIndex);
      }
      ////console.log(['momentum ended', {'in':props.numColumns, 'to':lastIndex}, lastOffset]);
      ////console.log('lastScrollOffset='+lastScrollOffset+', lastOffset='+lastOffset+', sampleHeight='+sampleHeight);
      setShowThumbScroll(false);
  }
  
  const _onScrollEnd = () => {
    ////console.log('scroll end called');
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
  },[scrollRef, scrollRef.current]);

  const adjustScrollPosition = (newOffset:{[key:string]:(2|3|4|number)}) => {
    let numColumns:number = props.numColumns;
    if( viewLoaded && numColumns !== newOffset.in){
      scrollRef?.current?.scrollToIndex(newOffset.to, false);
    }
  }
  /*useEffect(()=>{
    adjustScrollPosition(props.scrollOffset);
  },[props.scrollOffset]);*/

  const _onScroll = (rawEvent: ScrollEvent, offsetX: number, offsetY: number) => {
    //console.log(props.numColumns+'_'+rawEvent.nativeEvent.contentOffset.y);
    console.log('original onscroll')
    setShowThumbScroll(true);
  }

  const scrollHandlerReanimated = useAnimatedScrollHandler({
    onScroll: (e) => {
      //position.value = e.contentOffset.x;
      props.scrollY.value = e.contentOffset.y;
      layoutHeightAnimated.value = e.contentSize.height;
    },
    
    onEndDrag: (e) => {
      console.log('onEndDrag');
    },
    onMomentumEnd: (e) => {
      Reanimated.runOnJS(_onMomentumScrollEnd)();
      //let lastIndex = scrollRef?.current?.findApproxFirstVisibleIndex();
    },
  });
  const AnimatedRecyclerListView = Reanimated.createAnimatedComponent(RecyclerListView);
  return props.photos.layout ? (
    <Reanimated.View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[animatedStyle, {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
      }]}
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
        ////onEndReached={() => props.setLoadMore(new Date().getTime())}
        ////onEndReachedThreshold={0.4}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
        //onScroll={scrollHandlerReanimated}
        key={"RecyclerListView_"+props.sortCondition + props.numColumns}
        extendedState={{showSelectionCheckbox:props.showSelectionCheckbox}}
        scrollViewProps={{
          //ref: scrollRefExternal,
          
          //onMomentumScrollEnd: _onMomentumScrollEnd,
          ////onScrollEndDrag: _onScrollEnd,
          scrollRefExternal:scrollRefExternal,
          //scrollEventThrottle:16,
          //automaticallyAdjustContentInsets: false,
          //showsVerticalScrollIndicator:false,
          _onScrollExternal:scrollHandlerReanimated,
          //animatedEvent:{nativeEvent: {contentOffset: {y: props.scrollY}, contentSize: {height: layoutHeightAnimated}}},
          animatedEvent:{nativeEvent: {contentOffset:  {y: (y: any) =>
            Reanimated.block([

              Reanimated.call(
                [y],
                ([y]) => (props.scrollY = y)
              )
            ])
          }
        },
        },
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
        scrollY={props.scrollY}
        velocityY={velocityY}
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
    </Reanimated.View>
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

export default React.memo(RenderPhotos);
