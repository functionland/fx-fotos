import React, {useRef, createRef} from 'react';
import { Animated, View, useWindowDimensions, StyleSheet, Image, Text, StatusBar, SafeAreaView } from 'react-native';
import {
    PanGestureHandler,
    HandlerStateChangeEvent,
    PanGestureHandlerEventPayload,
    State,
  } from 'react-native-gesture-handler';


interface Props {
    scrollAnim: Animated.AnimatedAddition;
    HEADER_HEIGHT: number;
    headerShown: Animated.Value;
}

const Header: React.FC<Props> = (props) => {
    const panRef = createRef<PanGestureHandler>();
    const translationY = new Animated.Value(0);

    const SCREEN_WIDTH = useWindowDimensions().width;
    const SCREEN_HEIGHT = useWindowDimensions().height;
    
    const clampedScrollY = props.scrollAnim.interpolate({
    inputRange: [props.HEADER_HEIGHT, props.HEADER_HEIGHT + 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
    });
    const minusScrollY = Animated.multiply(clampedScrollY, -1);
    const translateY = useRef(Animated.diffClamp(minusScrollY, -props.HEADER_HEIGHT-(StatusBar.currentHeight||0), 0)).current;

    return (
        <SafeAreaView>
            <Animated.View 
            style={[styles.main, {
                height: props.HEADER_HEIGHT+2*(StatusBar.currentHeight || 0),
                width: 400,
                transform: [
                    {
                        translateY: translateY,
                    }
                ],
                opacity: props.headerShown
            }]}>
                    <View style={styles.item}></View>
                    <View style={[styles.item, ]}>
                        <Image 
                            source={require('../assets/images/logo30.png')}
                            style={[styles.image,{bottom:props.HEADER_HEIGHT/2}]}
                        />
                    </View>
                    <View style={styles.item}></View>
            </Animated.View>
        </SafeAreaView>
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