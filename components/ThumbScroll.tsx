import React, { useState, useEffect, createRef, useRef } from 'react';

import { Dimensions, StyleSheet, Animated, StyleProp, Image , Text, View } from 'react-native';
import { scrollImage } from '../assets/images';
import { headerIndex } from '../types/interfaces';
import { timestampToDate } from '../utils/functions';

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
    showThumbScroll:boolean;
    setShowThumbScroll:Function;
    scrollIndicatorContainerStyle:StyleProp<{}>;
    scrollIndicatorStyle:StyleProp<{}>;
    lastOffset:number;
    setLastScrollOffset:Function;
    numColumns:2|3|4;
    headerIndexes:headerIndex[];
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
    floatingFiltersOpacity: number;
    setFloatingFiltersOpacity: Function;
    currentImageTimestamp: number;
}
const ThumbScroll: React.FC<Props> = (props) => {
    //const AnimatedTouchable = Animated.createAnimatedComponent(TouchableWithoutFeedback);
    let panRef_glide = createRef<PanGestureHandler>();
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

    const showFloatingFilters = () => {
        console.log('showFloatingFilters');
        props.setFloatingFiltersOpacity(1);
    }
    const hideFloatingFilters = () => {
        console.log('hideFloatingFilters');
        props.setFloatingFiltersOpacity(0);
    }

    const _onDragPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationY:props.dragY, velocityY: props.velocityY,absoluteY: absoluteY, y: y, numberOfPointers:numberOfPointers} }],
        { useNativeDriver: true }
      );
    const _onDragPanHandlerStateChange = (event:HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        //console.log(event.nativeEvent);
        if (event.nativeEvent.state === State.BEGAN && event.nativeEvent.oldState !== State.ACTIVE) {
            console.log('glide touched');
            //props.isDragging.setValue(1);
            showFloatingFilters();
        }
        if(event.nativeEvent.state === State.CANCELLED || event.nativeEvent.state === State.FAILED || event.nativeEvent.state === State.END){
            hideFloatingFilters();
            props.setShowThumbScroll(false);
        }
        if (event.nativeEvent.state !== State.ACTIVE && event.nativeEvent.oldState === State.ACTIVE) {
            hideFloatingFilters();
            props.isDragging.setValue(2);
            let temp = props.lastOffset + event.nativeEvent.translationY;
            if(temp<0){temp=0;}
            if(temp>SCREEN_HEIGHT){temp=SCREEN_HEIGHT;}
            //console.log('temp='+temp);
            
            //props.dragY.setOffset(temp);
            
            props.setLastScrollOffset(temp);
            //props.scrollY.setOffset(temp);
        }
    };

    useEffect(()=> {
        //console.log('props.lastOffset='+props.lastOffset);
        props.dragY.setValue(0);
    },[props.lastOffset]);

    useEffect(()=>{
        startIndicatorShowHide();
    },[props.showThumbScroll])

    let startIndicatorShowHide = () =>{
        //Hide / show Animation effect
        if (props.shouldIndicatorHide) {
            props.showThumbScroll
                ? Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: props.hideTimeout,
                      useNativeDriver: true,
                  }).start(()=>{
                    runHideTimer();
                  })
                : Animated.timing(fadeAnim, {
                      toValue: 0,
                      duration: props.hideTimeout,
                      useNativeDriver: true,
                  }).start(()=>{
                    showIndicator();
                  });
        }
    }

    
    return (
                        <Animated.View style={[styles.scrollIndicatorContainer,  {height: props.indicatorHeight,}]}>
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
                                <View style={styles.scrollBar}>
                                    <Image
                                        source={ scrollImage} 
                                        style={[styles.image]} 
                                        resizeMethod='resize'
                                        resizeMode='stretch'
                                    />
                                    <Animated.View style={[styles.scrollBarText, {opacity: props.floatingFiltersOpacity}]}>
                                        <Text style={{color: 'grey'}}>{timestampToDate(props.currentImageTimestamp, ['month']).month}</Text>
                                    </Animated.View>
                                
                                </View>
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
        width: 50,
        height:50,
        opacity: 1,
        zIndex:1,
    },
    scrollIndicator: {
        right: -25,
        zIndex:4,
        borderRadius: 50,
        backgroundColor: 'whitesmoke',
        height:50,
        width:50,
        flexWrap: 'wrap',
    },
    image: {
        marginLeft:12,
        height: 20,
        width:10,
        marginTop:15,
    },
    scrollBar: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    scrollBarText: {
        position: 'absolute',
        right: 30,
        top: 10,
        backgroundColor: 'white',
        opacity:0.8,
        color: 'black',
        width: 100,
        borderRadius: 100,
        alignItems: 'center',
    }
});

export default ThumbScroll;