import React, { useEffect, createRef, } from 'react';

import { StyleSheet, useWindowDimensions, StyleProp, Image , Text, View } from 'react-native';
import { scrollImage } from '../assets/images';
import { headerIndex } from '../types/interfaces';
import { timestampToDate } from '../utils/functions';

import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
  } from 'react-native-gesture-handler';
  import { default as Reanimated, useAnimatedStyle, Extrapolate, useAnimatedGestureHandler, useSharedValue } from 'react-native-reanimated';


interface Props {
    indicatorHeight:number;
    flexibleIndicator:boolean;
    shouldIndicatorHide:boolean;
    hideTimeout:number;
    opacity:Reanimated.SharedValue<number>;
    showFloatingFilters: Reanimated.SharedValue<number>;
    scrollIndicatorContainerStyle:StyleProp<{}>;
    scrollIndicatorStyle:StyleProp<{}>;
    numColumns:2|3|4;
    dragY:Reanimated.SharedValue<number>;
    scrollY:Reanimated.SharedValue<number>;
    headerHeight:number;
    HEADER_HEIGHT: number;
    FOOTER_HEIGHT: number;
    layoutHeight: Reanimated.SharedValue<number>;
    currentImageTimestamp: number;
}
const ThumbScroll: React.FC<Props> = (props) => {
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const visibleHeight = (SCREEN_HEIGHT-props.indicatorHeight-props.HEADER_HEIGHT-props.FOOTER_HEIGHT);

    useEffect(()=>{
        console.log([Date.now()+': component ThumbScroll'+props.numColumns+' rendered']);
    });

    let panRef_glide = createRef<PanGestureHandler>();    

    const prevScrollY = useSharedValue(0);
    const _onPanGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, {}>({
        onStart: (_, ctx) => {
          props.opacity.value = 1;
          props.showFloatingFilters.value = 1;
          prevScrollY.value = props.scrollY.value;
        },
        onActive: (event, ctx) => {
          props.dragY.value = (prevScrollY.value) + (event.translationY*(props.layoutHeight.value-SCREEN_HEIGHT)/(visibleHeight));
        },
        onEnd: (event) => {
            props.opacity.value = Reanimated.withDelay(3000, Reanimated.withTiming(0, {duration:1000}));
            props.showFloatingFilters.value = Reanimated.withTiming(0, {duration:1000});
        },
        onCancel: () => {
            props.opacity.value = Reanimated.withDelay(3000, Reanimated.withTiming(0, {duration:1000}));
            props.showFloatingFilters.value = Reanimated.withTiming(0, {duration:1000});
        },
        onFail: () => {
            props.opacity.value = Reanimated.withDelay(3000, Reanimated.withTiming(0, {duration:1000}));
            props.showFloatingFilters.value = Reanimated.withTiming(0, {duration:1000});
        },
        onFinish: () => {
            props.opacity.value = Reanimated.withDelay(3000, Reanimated.withTiming(0, {duration:1000}));
            props.showFloatingFilters.value = Reanimated.withTiming(0, {duration:1000});
        },
    });

    const animatedStyle = useAnimatedStyle(()=>{
        return {
            transform: [
                {
                    translateY: Reanimated.interpolate((props.scrollY.value* (visibleHeight/(props.layoutHeight.value-visibleHeight))),
                        [props.HEADER_HEIGHT, visibleHeight],
                        [props.HEADER_HEIGHT, visibleHeight+props.HEADER_HEIGHT],
                        Extrapolate.CLAMP,
                    ),
                }
            ],
            opacity: props.opacity.value,
        };
    });
    
    const filtersAnimatedStyle = useAnimatedStyle(()=>{
        return {
            opacity: props.showFloatingFilters.value,
          };
    });

    return (
                        <Reanimated.View style={[styles.scrollIndicatorContainer,  {height: props.indicatorHeight,}]}>
                            <PanGestureHandler
                                ref={panRef_glide}
                                onGestureEvent={_onPanGestureEvent}
                                maxPointers={1}
                                minPointers={1}
                                shouldCancelWhenOutside={false}
                                ////hitSlop={{ right: 0, width:140 }}
                                avgTouches={false}
                                enableTrackpadTwoFingerGesture={false}
                            >
                            <Reanimated.View 
                                style={[
                                    styles.scrollIndicator,
                                    animatedStyle,
                                    { 
                                        height: props.indicatorHeight,
                                        zIndex:5,
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
                                    <Reanimated.View style={[styles.scrollBarText, filtersAnimatedStyle]}>
                                        <Text style={{color: 'grey'}}>{timestampToDate(props.currentImageTimestamp, ['month']).month}</Text>
                                    </Reanimated.View>
                                
                                </View>
                            </Reanimated.View>
                            </PanGestureHandler>
                        </Reanimated.View>

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

export default React.memo(ThumbScroll);