import React, { useState, useEffect, createRef, useRef } from 'react';

import { Dimensions, View, StyleSheet, Animated, StyleProp } from 'react-native';
import {calcLayoutHeight} from '../utils/functions';

import {
    PanGestureHandler,
    State,
    PanGestureHandlerEventPayload,
    HandlerStateChangeEvent,
  } from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
    indicatorHeight:number;
    flexibleIndicator:boolean;
    shouldIndicatorHide:boolean;
    hideTimeout:number;
    scrollIndicatorContainerStyle:StyleProp<{}>;
    scrollIndicatorStyle:StyleProp<{}>;
    lastOffset:number;
    numColumns: 2 | 3 | 4;
    headerIndexes:Array<{header:string;index:number;count:number;yearStart:string}>;
    numberOfPointers: Animated.Value;
    scrollY: Animated.Value;
    velocityY: Animated.Value;
    headerHeight: number;
}
const ThumbScroll: React.FC<Props> = (props) => {
    let panRef = createRef();

    
    let numberOfPointers = useRef(new Animated.Value(0)).current;
    const [fullSizeContentHeight, setFullSizeContentHeight] = useState<number>(0);

    const [fadeAnim] = useState(
        new Animated.Value(props.shouldIndicatorHide ? 0 : 1),
    );

    const [isIndicatorHidden, setIsIndicatorHidden] = useState(
        props.shouldIndicatorHide,
    );

    const transformY:Animated.AnimatedInterpolation = Animated.add(Animated.multiply(Animated.subtract(props.numberOfPointers, 2) , props.scrollY), props.lastOffset).interpolate({
        inputRange: [0, fullSizeContentHeight],
        outputRange: [0, SCREEN_HEIGHT]  // 0 : 150, 0.5 : 75, 1 : 0
    });

    const runHideTimer = () => {
        props.shouldIndicatorHide && setIsIndicatorHidden(true);
    };

    const showIndicator = () => {
        props.shouldIndicatorHide && setIsIndicatorHidden(false);
    };

    let _onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: props.scrollY, velocityY: props.velocityY,} }],
        { useNativeDriver: true }
      );
    let _onPanHandlerStateChange = (event:HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        console.log(State);
        console.log(event.nativeEvent);
        if (event.nativeEvent.state !== State.ACTIVE) {
            startIndicatorShowHide();
        }
    };

    useEffect(()=> {
        setFullSizeContentHeight(calcLayoutHeight(props.numColumns,props.headerIndexes, SCREEN_WIDTH, props.headerHeight));
    },[props.numColumns, props.headerIndexes]);

    let startIndicatorShowHide = () =>{
        //Hide / show Animation effect
        if (props.shouldIndicatorHide) {
            isIndicatorHidden
                ? Animated.timing(fadeAnim, {
                      toValue: 0,
                      duration: props.hideTimeout,
                      useNativeDriver: true,
                  }).start(()=>{
                    runHideTimer();
                  })
                : Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: props.hideTimeout,
                      useNativeDriver: true,
                  }).start(()=>{
                    showIndicator();
                  });
        }
    }

    return (
 
                
                
                    <PanGestureHandler
                        ref={panRef}
                        onGestureEvent={_onPanGestureEvent}
                        onHandlerStateChange={_onPanHandlerStateChange}
                        maxPointers={1}
                        minPointers={1}
                        shouldCancelWhenOutside={false}
                        //hitSlop={{ right: 0, width:140 }}
                        avgTouches={false}
                        enableTrackpadTwoFingerGesture={false}
                    >
                        <Animated.View
                    style={[
                        styles.scrollIndicatorContainer,
                        { opacity: fadeAnim },
                        props.scrollIndicatorContainerStyle,
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.scrollIndicator,
                            { 
                                top: 0, 
                                height: 150,
                                transform: [{
                                    translateY: transformY,
                                  }],
                            
                            },
                            props.scrollIndicatorStyle,
                        ]}
                    >
                    </Animated.View>
                </Animated.View>   
                    </PanGestureHandler>

    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        //flex: 1,
        width:50,
    },
    scrollIndicatorContainer: {
        position: 'absolute',
        top: 0,
        right: 2,
        bottom: 0,
        overflow: 'visible',
        borderRadius: 10,
        width: 60,
        marginVertical: 3,
        height: SCREEN_HEIGHT,
        zIndex:1,
    },
    scrollIndicator: {
        position: 'absolute',
        right: 0,
        width: 160,
        borderRadius: 3,
        opacity: 0.5,
        backgroundColor: 'blue',
        zIndex:4,
    },
});

export default ThumbScroll;