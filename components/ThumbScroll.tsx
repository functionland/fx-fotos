import React, { useState, useEffect, createRef, useRef } from 'react';

import { Dimensions, StyleSheet, Animated, StyleProp } from 'react-native';

import {
    PanGestureHandler,
    State,
    PanGestureHandlerEventPayload,
    HandlerStateChangeEvent,
  } from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
    indicatorHeight:number;
    flexibleIndicator:boolean;
    shouldIndicatorHide:boolean;
    hideTimeout:number;
    scrollIndicatorContainerStyle:StyleProp<{}>;
    scrollIndicatorStyle:StyleProp<{}>;
    lastOffset:number;
    setLastScrollOffset:Function;
    numColumns:2|3|4;
    headerIndexes:Array<{header:string;index:number;count:number;yearStart:string}>;
    numberOfPointers:Animated.Value;
    scrollY:Animated.Value;
    velocityY:Animated.Value;
    headerHeight:number;
    fullSizeContentHeight:number;
    scrollRef:any;
    setStartScroll:Function;
    startScroll:boolean;
}
const ThumbScroll: React.FC<Props> = (props) => {
    let panRef = createRef();
    const absoluteY = useRef(new Animated.Value(0)).current;
    const y = useRef(new Animated.Value(0)).current;
    const resetScrollY = useRef(new Animated.Value(1)).current;
    
    let numberOfPointers = useRef(new Animated.Value(1)).current;

    const [fadeAnim] = useState(
        new Animated.Value(props.shouldIndicatorHide ? 0 : 1),
    );

    const [isIndicatorHidden, setIsIndicatorHidden] = useState(
        props.shouldIndicatorHide,
    );

    /*const transformY:Animated.AnimatedInterpolation = Animated.add(Animated.multiply(Animated.subtract(2, props.numberOfPointers) , props.scrollY), props.lastOffset).interpolate({
        inputRange: [0, fullSizeContentHeight],
        outputRange: [0, SCREEN_HEIGHT]  // 0 : 150, 0.5 : 75, 1 : 0
    });*/
    const transformY:Animated.AnimatedInterpolation = props.scrollY;
    //const transformY:Animated.AnimatedInterpolation = Animated.add(Animated.subtract(Animated.subtract(absoluteY, y), (StatusBar.currentHeight||0)),props.scrollY);
    const runHideTimer = () => {
        props.shouldIndicatorHide && setIsIndicatorHidden(true);
    };

    const showIndicator = () => {
        props.shouldIndicatorHide && setIsIndicatorHidden(false);
    };

    let _onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: props.scrollY, velocityY: props.velocityY,absoluteY: absoluteY, y: y, numberOfPointers:numberOfPointers} }],
        { useNativeDriver: true }
      );
    let _onPanHandlerStateChange = (event:HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        //console.log(event.nativeEvent);
        if (event.nativeEvent.state === State.ACTIVE) {
            props.setStartScroll(true);
        }
        if (event.nativeEvent.oldState === State.ACTIVE) {
            let temp = props.lastOffset + event.nativeEvent.translationY;
            props.setLastScrollOffset(temp);
            props.scrollY.setOffset(temp);
            props.scrollY.setValue(0);
            startIndicatorShowHide();
        }
    };
    useEffect(()=> {
        //props.setStartScroll(false);
    },[props.lastOffset]);

    useEffect(()=>{
console.log('startScroll is '+ props.startScroll+ ' in '+props.numColumns);
    },[props.startScroll])

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
                                styles.scrollIndicator,
                                { 
                                    top: 0, 
                                    height: props.indicatorHeight,
                                    transform: [{
                                        translateY: props.scrollY.interpolate({
                                            inputRange: [0, SCREEN_HEIGHT-props.indicatorHeight],
                                            outputRange: [0, SCREEN_HEIGHT-props.indicatorHeight],
                                            extrapolateRight: 'clamp',
                                            extrapolateLeft: 'clamp',
                                          }),
                                    }],
                                    opacity: fadeAnim,
                                },
                                props.scrollIndicatorStyle,
                            ]}
                        >
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