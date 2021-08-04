import React, {useEffect, } from 'react';
import { 
    View, 
    StyleSheet, 
    Image, 
    StatusBar,
    Pressable
} from 'react-native';
import {
    default as Reanimated, 
    useAnimatedStyle, 
    useSharedValue, 
    Extrapolate, 
    useAnimatedReaction, 
    useDerivedValue,
    interpolate,
} from 'react-native-reanimated';
import Auth from './TopMenu';


interface Props {
    scrollY2: Reanimated.SharedValue<number>;
    scrollY3: Reanimated.SharedValue<number>;
    scrollY4: Reanimated.SharedValue<number>;
    HEADER_HEIGHT: number;
    headerShown: Reanimated.SharedValue<number>;
    navigation: any;
}

const Header: React.FC<Props> = (props) => {
    useEffect(()=>{
        console.log('HEADER mounted');
    });
	
    const translateY_t = useSharedValue(0);
    const translateY = useSharedValue(0);

    const animScroll = useSharedValue<number>(0);
    useDerivedValue(() => {
        animScroll.value = (props.scrollY2.value+props.scrollY3.value+props.scrollY4.value);
    }, [props.scrollY2, props.scrollY3, props.scrollY4]);
    useAnimatedReaction(() => {
            return animScroll.value;
        }, (result, previous) => {
            if (result !== previous) {
                const diff =  (previous||0) - result;
                translateY.value = interpolate(
                    translateY.value+diff,
                    [-props.HEADER_HEIGHT*2, 0],
                    [-props.HEADER_HEIGHT*2, 0],
                    Extrapolate.CLAMP
                );
            }
        }, [animScroll]);

    const animatedStyle = useAnimatedStyle(()=>{
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
                height: props.HEADER_HEIGHT+(StatusBar.currentHeight || 0),
                width: 400,
            }]}>
                    <View style={styles.item}></View>
                    <View style={[styles.item, ]}>
                        <Image 
                            source={require('../assets/images/logo30.png')}
                            style={[styles.image,{bottom:props.HEADER_HEIGHT/2}]}
                        />
                    </View>
                    <View style={styles.item}>
						<Auth navigation={props.navigation} />
                    </View>
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
        marginTop: 0,
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
    },
    profilePic: {
        borderRadius: 35,
        width:35,
        height: 35,
        backgroundColor: 'grey',
        alignSelf:'center',
        marginTop: '10%'
    }
  });

export default React.memo(Header);