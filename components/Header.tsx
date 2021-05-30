import React, {useEffect, createRef} from 'react';
import { Animated, View, useWindowDimensions, StyleSheet, Image, Text } from 'react-native';
import {
    PanGestureHandler,
    HandlerStateChangeEvent,
    PanGestureHandlerEventPayload,
    State,
  } from 'react-native-gesture-handler';


interface Props {
    scrollAnim: Animated.Value;
    HEADER_HEIGHT: number;
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
    const translateY = Animated.diffClamp(minusScrollY, -props.HEADER_HEIGHT, 0);

    return (
            <Animated.View 
            style={[styles.main, {
                height: props.HEADER_HEIGHT,
                transform: [
                    {
                        translateY: translateY,
                    }
                ]
            }]}>
                    <View style={styles.item}></View>
                    <View style={styles.item}>
                        <Image 
                            source={require('../assets/images/logo30.png')}
                            style={styles.image}
                        />
                    </View>
                    <View style={styles.item}></View>
            </Animated.View>
    )
}
const styles = StyleSheet.create({
    main: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      position: 'relative',
      top: 0,
      left: 0,
      backgroundColor: 'white',

    },
    item: {
        flex: 1/3,
        backgroundColor: 'transparent',
        
    },
    image: {
        
    }
  });

export default Header;