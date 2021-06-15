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
import { timestampToDate } from '../utils/functions';

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
  modalShown: Reanimated.SharedValue<number>;
  headerShown: Reanimated.SharedValue<number>;
  storiesHeight: number;
  showStory:Animated.Value;
  scrollY: Reanimated.SharedValue<number>;
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  onMediaLongTap: Function;
  showSelectionCheckbox:boolean;
  selectedAssets:Asset[]|undefined;
  animatedImagePositionX: Reanimated.SharedValue<number>;
  animatedImagePositionY: Reanimated.SharedValue<number>;
  animatedSingleMediaIndex: Reanimated.SharedValue<number>;
  singleImageWidth: Reanimated.SharedValue<number>;
  singleImageHeight: Reanimated.SharedValue<number>;
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
  const scrollRef:any = useRef();
  const scrollRefExternal = useAnimatedRef<Reanimated.ScrollView>();
  const dragY = useSharedValue(0);
  const showThumbScroll = useSharedValue(0);
  const showFloatingFilters = useSharedValue(0);

  const animatedTimeStampString = useSharedValue('');

  const layoutHeightAnimated = useSharedValue(99999999);

  const [currentImageTimestamp, setCurrentImageTimestamp] = useState<number>(0);

  const animatedStyle = Reanimated.useAnimatedStyle(()=>{
    const scale = (props.numColumns===props.numColumnsAnimated.value)?Reanimated.interpolate(
      props.scale.value,
      [0,1,4],
      [props.numColumns/(props.numColumns+1),1,(props.numColumns)/(props.numColumns-1)]
    ):((props.numColumns===props.numColumnsAnimated.value+1)?Reanimated.interpolate(
      props.scale.value,
      [0,1,4],
      [1,(props.numColumns)/(props.numColumns-1),(props.numColumns)/(props.numColumns-1)]
    ):((props.numColumns===props.numColumnsAnimated.value-1)?Reanimated.interpolate(
      props.scale.value,
      [0,1,4],
      [(props.numColumns)/(props.numColumns+1),(props.numColumns)/(props.numColumns+1),1]
    ):1));
    
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
            scale: scale,
          },
          {
            translateX: (
              (
                (
                  scale*SCREEN_WIDTH)- 
                SCREEN_WIDTH)
              / (2*scale))
          },
          {
            translateY: (
              (
                (
                  scale*(SCREEN_HEIGHT-(StatusBar.currentHeight || 0))
                ) - (SCREEN_HEIGHT-(StatusBar.currentHeight || 0))
              )
              / (2*scale))
          }
        ],
      };
});

  useEffect(()=>{
    console.log([Date.now()+': component RenderPhotos'+props.numColumns+' rendered']);
  });


  //scrollRefExternal?.current?.scrollTo({x:0,y:100});

  useEffect(()=>{
    console.log(['component RenderPhotos mounted '+props.numColumns]);

    if(props.numColumns===3 || props.numColumns===4){
      //props.scrollIndex2.removeAllListeners();
      props.scrollIndex2.addListener(({value})=>{
        scrollRef?.current?.scrollToIndex(value, false);
      });
    }

    if(props.numColumns===2 || props.numColumns===3){
      //props.scrollIndex4.removeAllListeners();
      props.scrollIndex4.addListener(({value})=>{
        scrollRef?.current?.scrollToIndex(value, false);
      });
    }

    if(props.numColumns===2 || props.numColumns===4){
      //props.scrollIndex3.removeAllListeners();
      props.scrollIndex3.addListener(({value})=>{
        scrollRef?.current?.scrollToIndex(value, false);
      });
    }
    return () => {
      console.log(['component RenderPhotos unmounted']);
      if(props.numColumns===2 || props.numColumns ===3){
        props.scrollIndex4.removeAllListeners();
      }
      if(props.numColumns===3 || props.numColumns ===4){
        props.scrollIndex2.removeAllListeners();
      }
      if(props.numColumns===2 || props.numColumns ===4){
        props.scrollIndex3.removeAllListeners();
      }
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
          <SafeAreaView  style={{position:'relative', zIndex:1,marginTop:props.HEADER_HEIGHT}}>
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
                <View 
                  style={{
                    width:15+props.storiesHeight/1.618,
                    height:props.storiesHeight+25,
                  }}>
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
      <PhotosChunk
        photo={data}
        numCol={props.numColumns}
        key={'PhotosChunk_col' + props.numColumns + '_id' + index}
        index={data.index}
        sortCondition={props.sortCondition}
        modalShown={props.modalShown}
        headerShown={props.headerShown}
        headerHeight={headerHeight}
        onMediaLongTap={props.onMediaLongTap}
        showSelectionCheckbox={props.showSelectionCheckbox}
        selectedAssets={props.selectedAssets}
        animatedImagePositionX={props.animatedImagePositionX}
        animatedImagePositionY={props.animatedImagePositionY}
        animatedSingleMediaIndex={props.animatedSingleMediaIndex}
        singleImageWidth={props.singleImageWidth}
        singleImageHeight={props.singleImageHeight}
        imageWidth={(typeof data.value !== 'string')?data.value.width:0}
        imageHeight={(typeof data.value !== 'string')?data.value.height:0}
      />
    );
    }
  };

  useEffect(()=>{
    
  },[props.numColumns, scrollRef?.current]);

  
  const _onMomentumScrollEnd = () => {
    let currentTimeStamp = 0;
      let lastIndex = (scrollRef?.current?.findApproxFirstVisibleIndex() || 0);
      let currentImage = props.photos.layout[lastIndex].value;

      if(typeof currentImage === 'string'){
        currentImage = props.photos.layout[lastIndex+1]?.value;
        if(currentImage && typeof currentImage === 'string'){
          currentImage = props.photos.layout[lastIndex+2]?.value;
        }
      }
      if(currentImage && typeof currentImage !== 'string'){
        currentTimeStamp = currentImage.modificationTime;
      }
      let currentTimeStampString = timestampToDate(currentTimeStamp, ['month']).month;
      animatedTimeStampString.value = currentTimeStampString;

      if(props.numColumns===2){
        props.scrollIndex2.setValue(lastIndex);
      }else if(props.numColumns===3){
        props.scrollIndex3.setValue(lastIndex);
      }else if(props.numColumns===4){
        props.scrollIndex4.setValue(lastIndex);
      }
      ////console.log(['momentum ended', {'in':props.numColumns, 'to':lastIndex}, lastOffset]);
      showThumbScroll.value = Reanimated.withDelay(3000, Reanimated.withTiming(0));
  }
  useDerivedValue(() => {
    let approximateIndex = Math.ceil(dragY.value/props.numColumns);
    
    //animatedTimeStampString.value = approximateIndex.toString();
    reanimatedScrollTo(scrollRefExternal, 0, dragY.value, false);
  });

  const scrollBarToViewSync = (value:number)=> {
    let sampleHeight = scrollRef?.current?.getContentDimension().height;
    //console.log('value='+value);
    //console.log('ViewOffset='+ViewOffset);
    //console.log('sampleHeight='+sampleHeight);
    //console.log('SCREEN_HEIGHT='+SCREEN_HEIGHT);
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



  /*useEffect(()=>{
    adjustScrollPosition(props.scrollOffset);
  },[props.scrollOffset]);*/

  const scrollHandlerReanimated = useAnimatedScrollHandler({
    onScroll: (e) => {
      //position.value = e.contentOffset.x;
      props.scrollY.value = e.contentOffset.y;
      layoutHeightAnimated.value = e.contentSize.height;
      showThumbScroll.value = 1;
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
                ([y]) => {}
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
        opacity={showThumbScroll}
        showFloatingFilters={showFloatingFilters}
        hideTimeout={500}
        dragY={dragY}
        numColumns={props.numColumns}
        headerHeight={headerHeight}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        scrollY={props.scrollY}
        scrollIndicatorContainerStyle={{}}
        scrollIndicatorStyle={{}}
        layoutHeight={layoutHeightAnimated}
        currentImageTimestamp={animatedTimeStampString}
      />
      <FloatingFilters
        headerIndexes={props.photos.headerIndexes}
        floatingFiltersOpacity={showFloatingFilters}
        numColumns={props.numColumns}
        sortCondition={props.sortCondition}
        headerHeight={headerHeight}
        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
        HEADER_HEIGHT={props.HEADER_HEIGHT}
        indicatorHeight={indicatorHeight}
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

export default RenderPhotos;
