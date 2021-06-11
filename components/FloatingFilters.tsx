import React, { useState, useEffect, useRef } from 'react';

import { Dimensions, StyleSheet, Animated, StyleProp, Image , Text, View } from 'react-native';
import { headerIndex } from '../types/interfaces';
import {default as Reanimated,} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
    headerIndexes:headerIndex[];
    floatingFiltersOpacity: number;
    numColumns: 2 | 3 | 4;
    sortCondition: 'day' | 'month';
    scrollRef: any;
    headerHeight: number;
    layoutHeight: Reanimated.SharedValue<number>;
}


const filterItem = (year:string, top: number) => {
    
    if(year !== ''){
        ////console.log('year='+year+', top='+top);
        return (
            <View style={[styles.FilterItem, {top: top}]} key={'Year_'+year}>
                <Text style={styles.FilterText}>
                    { year }
                </Text>
            </View>
        );
    }
}

const showFilterItems = (filters:headerIndex[], numColumns:number, layoutHeight:number, headerHeight:number) => {
    if(layoutHeight===0){
        layoutHeight=99999999999;
    }
    let filterItems = [];
    let top = 0;
    for(let i=0; i<filters.length; i++){
        let sum: number = headerHeight + Math.ceil(filters[i].count/numColumns)*(SCREEN_WIDTH/numColumns);
        filterItems.push(filterItem(filters[i].yearStart, top));
        top = SCREEN_HEIGHT*(sum/layoutHeight) + top;
    }
    return filterItems;
}

const FloatingFilters: React.FC<Props> = (props) => {
    useEffect(()=>{
        console.log([Date.now()+': component FloatingFilters'+props.numColumns+' rendered']);
    });
    const opacity = useRef(new Animated.Value(0)).current;

    const fadeOutIn = (value:number) => {
        Animated.timing(opacity, {
            toValue: value,
            duration: 100,
            useNativeDriver: true,
          }).start();
    };
    useEffect(() => {
        fadeOutIn(props.floatingFiltersOpacity);
    },[props.floatingFiltersOpacity]);

    const headerIndexesMonth = props.headerIndexes.filter(header => header.sortCondition===props.sortCondition);
    return (
        <Animated.View style={[styles.MainView, {opacity: opacity, zIndex: opacity}]}>
            {
                showFilterItems(headerIndexesMonth, props.numColumns, props.layoutHeight.value, props.headerHeight)
            }
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    MainView : {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        position: 'absolute',
        flex: 1,
    },
    FilterItem:{
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: SCREEN_WIDTH,
        color: 'black',
        zIndex:1,
        opacity: 0.8,
        width: 100,
        height: 20,
        textAlign: 'center',
        borderColor: 'darkgrey',
        borderWidth: 0.1,
        right: SCREEN_WIDTH/2 - 75,
    },
    FilterText:{
        color: 'black',
        textAlign: 'center',
    }
});
function arePropsEqual(prevProps:Props, nextProps:Props) {
    console.log('FloatingFilters memo condition:');
    return prevProps.floatingFiltersOpacity===nextProps.floatingFiltersOpacity && prevProps.headerIndexes?.length===nextProps.headerIndexes?.length; 
}
export default React.memo(FloatingFilters, arePropsEqual);