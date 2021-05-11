import React, { useState, useEffect } from 'react';

import { Dimensions, View, StyleSheet, Animated, StyleProp } from 'react-native';
import {calcLayoutHeight} from '../utils/functions';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
    indicatorHeight:number;
    flexibleIndicator:boolean;
    shouldIndicatorHide:boolean;
    hideTimeout:number;
    scrollIndicatorContainerStyle:StyleProp<{}>;
    scrollIndicatorStyle:StyleProp<{}>;
    scrollY:Animated.Value;
    lastOffset:number;
    numColumns: 2 | 3 | 4;
    headerIndexes:Array<{header:string;index:number;count:number;yearStart:string}>;
    numberOfPointers: Animated.Value;
    headerHeight: number;
}
const ThumbScroll: React.FC<Props> = (props) => {
    const [fullSizeContentHeight, setFullSizeContentHeight] = useState<number>(0);

    const [fadeAnim] = useState(
        new Animated.Value(props.shouldIndicatorHide ? 0 : 1),
    );

    const [isIndicatorHidden, setIsIndicatorHidden] = useState(
        props.shouldIndicatorHide,
    );

    const transformY:Animated.AnimatedInterpolation = Animated.add(Animated.multiply(Animated.subtract(props.numberOfPointers, 2) ,props.scrollY), props.lastOffset).interpolate({
        inputRange: [0, fullSizeContentHeight],
        outputRange: [0, SCREEN_HEIGHT]  // 0 : 150, 0.5 : 75, 1 : 0
    });

    const runHideTimer = () => {
        props.shouldIndicatorHide && setIsIndicatorHidden(true);
    };

    const showIndicator = () => {
        props.shouldIndicatorHide && setIsIndicatorHidden(false);
    };

    useEffect(()=> {
        setFullSizeContentHeight(calcLayoutHeight(props.numColumns,props.headerIndexes, SCREEN_WIDTH, props.headerHeight));
    },[props.numColumns, props.headerIndexes]);
    useEffect(() => {
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
    }, [props.shouldIndicatorHide]);

    return (
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
                                height: 50,
                                transform: [{
                                    translateY: transformY,
                                  }],
                            
                            },
                            props.scrollIndicatorStyle,
                        ]}
                    >
                    </Animated.View>
                </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    scrollViewContainer: {
        flex: 1,
    },
    scrollIndicatorContainer: {
        position: 'absolute',
        top: 0,
        right: 2,
        bottom: 0,
        overflow: 'hidden',
        borderRadius: 10,
        width: 6,
        marginVertical: 3,
        height: SCREEN_HEIGHT,
    },
    scrollIndicator: {
        position: 'absolute',
        right: 0,
        width: 6,
        borderRadius: 3,
        opacity: 0.5,
        backgroundColor: 'blue',
    },
});

export default ThumbScroll;