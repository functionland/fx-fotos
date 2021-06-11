import React, {useEffect, useRef} from 'react';
import { Animated, View, useWindowDimensions, StyleSheet, Image, Text, StatusBar, SafeAreaView } from 'react-native';
import {
    PanGestureHandler,
    HandlerStateChangeEvent,
    PanGestureHandlerEventPayload,
    State,
  } from 'react-native-gesture-handler';
  import {default as Reanimated, useAnimatedStyle, useSharedValue, Extrapolate} from 'react-native-reanimated';

interface Props {
    scrollY2: Reanimated.SharedValue<number>;
    scrollY3: Reanimated.SharedValue<number>;
    scrollY4: Reanimated.SharedValue<number>;
    HEADER_HEIGHT: number;
    headerShown: Reanimated.SharedValue<number>;
}

const Header: React.FC<Props> = (props) => {
    useEffect(()=>{
        console.log('HEADER mounted');
    })
    const minusScrollYPrevRef = useSharedValue(0);
    const translateY = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(()=>{
        const clamp = (num:number, min:number, max:number) => {
            return num <= min 
              ? min 
              : num >= max 
                ? max 
                : num
          }
        const animScroll = (props.scrollY2.value+props.scrollY3.value+props.scrollY4.value);
        const clampedScrollY = Reanimated.interpolate(animScroll, [props.HEADER_HEIGHT, props.HEADER_HEIGHT + 1], [0, 1], Extrapolate.CLAMP);
        const minusScrollY = -1*clampedScrollY;
        //const translateY = Reanimated.diffClamp(minusScrollY, -props.HEADER_HEIGHT, 0);
        translateY.value = clamp(translateY.value + (minusScrollY-minusScrollYPrevRef.value), -props.HEADER_HEIGHT, 0)
        minusScrollYPrevRef.value = minusScrollY;
        return {
            transform: [{
                translateY: translateY.value,
            }],
             opacity: props.headerShown.value
          };
    });
    return (
            <Reanimated.View 
            style={[styles.main, animatedStyle, {
                height: props.HEADER_HEIGHT+2*(StatusBar.currentHeight || 0),
                width: 400,
            }]}>
                    <View style={styles.item}></View>
                    <View style={[styles.item, ]}>
                        <Image 
                            source={require('../assets/images/logo30.png')}
                            style={[styles.image,{bottom:props.HEADER_HEIGHT/2}]}
                        />
                    </View>
                    <View style={styles.item}></View>
            </Reanimated.View>
    )
}
const styles = StyleSheet.create({
    main: {
        flexDirection: 'row',
        flex:1,
        flexWrap: 'nowrap',
        position: 'relative',
        top: 0,
        left: 0,
        marginTop: -1*(StatusBar.currentHeight || 0),
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        marginLeft: -15
    },
    item: {
        flex: 1/3,
        backgroundColor: 'transparent',
        bottom: 0,
        height: '100%',
    },
    image: {
        position: 'absolute',
        alignSelf:'center',
        //backgroundColor: 'blue'
    }
  });

export default Header;