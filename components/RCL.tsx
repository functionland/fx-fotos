import React from 'react';
import { RecyclerListView, LayoutProvider } from 'recyclerlistview';
import {
    useRecoilState,
  } from 'recoil';
  import {
    storiesState,
    dataProviderState, 
  } from '../states';

  interface Props {
    scrollRef: any;
    externalScrollView: any;
    itemAnimator: any;
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;
    layoutProvider: LayoutProvider;
    rowRenderer: any;
    scrollRefExternal: any;
    scrollHandlerReanimated: any;

  }

  const RCL: React.FC<Props> = (props) => {
    const [dataProvider] = useRecoilState(dataProviderState);
    return (
      <RecyclerListView
        ref={props.scrollRef}
        //renderAheadOffset={2*props.SCREEN_HEIGHT}
        externalScrollView={props.externalScrollView}
        //itemAnimator={props.itemAnimator}
        style={{
          flex: 1,
          width: props.SCREEN_WIDTH,
          height: props.SCREEN_HEIGHT,
          position: 'absolute',
          top: 0,
          bottom: 0,
          marginTop: 0,
          right: 0,
          left: 0,
          zIndex:1,
        }}
        optimizeForInsertDeleteAnimations={true}
        ////onEndReached={() => props.setLoadMore(new Date().getTime())}
        ////onEndReachedThreshold={0.4}
        dataProvider={dataProvider}
        layoutProvider={props.layoutProvider}
        rowRenderer={props.rowRenderer}
        //onScroll={scrollHandlerReanimated}
        scrollViewProps={{
          //ref: scrollRefExternal,
          
          //onMomentumScrollEnd: _onMomentumScrollEnd,
          ////onScrollEndDrag: _onScrollEnd,
          scrollRefExternal:props.scrollRefExternal,
          //scrollEventThrottle:16,
          //automaticallyAdjustContentInsets: false,
          //showsVerticalScrollIndicator:false,
          _onScrollExternal:props.scrollHandlerReanimated,
          //animatedEvent:{nativeEvent: {contentOffset: {y: props.scrollY}, contentSize: {height: layoutHeightAnimated}}},
        }}
      />
    );
  }

  const isEqual = (prevProps:Props, nextProps:Props) => {
    return (prevProps.layoutProvider === nextProps.layoutProvider);
  }
  
  export default React.memo(RCL, isEqual);