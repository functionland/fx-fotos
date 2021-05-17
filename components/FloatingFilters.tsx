import React, { useState, useEffect, createRef, useRef } from 'react';

import { Dimensions, StyleSheet, Animated, StyleProp, Image , Text, View } from 'react-native';
import { headerIndex } from '../types/interfaces';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
    headerIndexes:headerIndex[];
    floatingFiltersOpacity: number;
    numColumns: 2 | 3 | 4;
    sortCondition: 'day' | 'month';
    scrollRef: any;
    headerHeight: number;
    layoutHeight: Animated.Value;
}


const filterItem = (year:string, top: number) => {
    if(year !== ''){
        console.log('year='+year+', top='+top);
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
    const opacity = useRef(new Animated.Value(0)).current;
    const [layoutHeight, setLayoutHeight] = useState<number>(0);
    const [filterItems, setFilterItems] = useState<any[]>([]);
    useEffect(()=>{
        setLayoutHeight(props.scrollRef?.current?.getContentDimension().height);
    },[props.scrollRef, props.scrollRef.current]);
    props.layoutHeight.addListener(({value})=>{
        if(value !== layoutHeight){
            setLayoutHeight(value);
        }
    });

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

    useEffect(()=>{
        console.log('layoutHeight='+layoutHeight);
        setFilterItems(showFilterItems(headerIndexesMonth, props.numColumns, layoutHeight, props.headerHeight));
    },[layoutHeight]);

    const headerIndexesMonth = props.headerIndexes.filter(header => header.sortCondition===props.sortCondition);
    return (
        <Animated.View style={[styles.MainView, {opacity: opacity, zIndex: opacity}]}>
            {
                filterItems
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
export default FloatingFilters;