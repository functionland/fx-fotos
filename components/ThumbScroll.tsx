import React, { useState, useEffect, createRef, useRef } from 'react';

import { Dimensions, StyleSheet, Animated, StyleProp, TouchableHighlight , Text, View } from 'react-native';

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
    setEndScroll: Function;
    layoutHeight: Animated.Value;
    isDragging:Animated.Value;
    dragY:Animated.Value;
}
const ThumbScroll: React.FC<Props> = (props) => {
    //const AnimatedTouchable = Animated.createAnimatedComponent(TouchableWithoutFeedback);
    let panRef_glide = createRef();
    const absoluteY = useRef(new Animated.Value(0)).current;
    const y = useRef(new Animated.Value(0)).current;
    
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

    const _onDragPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationY:props.dragY, velocityY: props.velocityY,absoluteY: absoluteY, y: y, numberOfPointers:numberOfPointers} }],
        { useNativeDriver: true }
      );
    const _onDragPanHandlerStateChange = (event:HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        //console.log([event.nativeEvent.absoluteY,event.nativeEvent.y,event.nativeEvent.translationY]);
        if (event.nativeEvent.state === State.BEGAN && event.nativeEvent.oldState !== State.ACTIVE) {
            console.log('glide touched');
            //props.isDragging.setValue(1);
        }
        if (event.nativeEvent.state !== State.ACTIVE && event.nativeEvent.oldState === State.ACTIVE) {
            
            props.isDragging.setValue(2);
            let temp = props.lastOffset + event.nativeEvent.translationY;
            if(temp<0){temp=0;}
            if(temp>SCREEN_HEIGHT){temp=SCREEN_HEIGHT;}
            console.log('temp='+temp);
            
            //props.dragY.setOffset(temp);
            
            props.setLastScrollOffset(temp);
            //props.scrollY.setOffset(temp);
            startIndicatorShowHide();
        }
    };

    useEffect(()=> {
        console.log('props.lastOffset='+props.lastOffset);
        props.dragY.setValue(0);
    },[props.lastOffset]);

    useEffect(()=>{

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
                        <Animated.View style={[styles.scrollIndicatorContainer, {height: props.indicatorHeight,}]}>
                            <PanGestureHandler
                                ref={panRef_glide}
                                onGestureEvent={_onDragPanGestureEvent}
                                onHandlerStateChange={_onDragPanHandlerStateChange}
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
                                        height: props.indicatorHeight,
                                        zIndex:5,
                                        transform: [{
                                            translateY: Animated.multiply(props.scrollY, Animated.divide((SCREEN_HEIGHT-props.indicatorHeight), Animated.subtract(props.layoutHeight, SCREEN_HEIGHT))).interpolate({
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
                        </Animated.View>

    );
};

const styles = StyleSheet.create({
    scrollIndicatorContainer: {
        top: 0,
        position: 'absolute',
        right: 0,
        width: 0,
        opacity: 1,
        zIndex:1,
    },
    scrollIndicator: {
        top: 0,
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