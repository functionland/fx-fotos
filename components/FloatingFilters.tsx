import React, { FC, useEffect, useRef } from 'react';

import { Dimensions, StyleSheet, StatusBar, StyleProp, useWindowDimensions , Text, View } from 'react-native';
import { headerIndex } from '../types/interfaces';
import {default as Reanimated, useAnimatedStyle,} from 'react-native-reanimated';

const statusBarHeight = StatusBar.currentHeight||0;
interface Props {
    headerIndexes:headerIndex[];
    floatingFiltersOpacity: Reanimated.SharedValue<number>;
    numColumns: 2 | 3 | 4;
    sortCondition: 'day' | 'month';
    headerHeight: number;
    HEADER_HEIGHT: number;
    FOOTER_HEIGHT: number;
    indicatorHeight:number;
    layoutHeight: Reanimated.SharedValue<number>;
}

interface FilterItemProps {
    year:string;
    sum: number;
    layoutHeight:Reanimated.SharedValue<number>;
    index:number;
    headerHeight:number;
    HEADER_HEIGHT: number;
    FOOTER_HEIGHT: number;
    indicatorHeight:number;
}

interface FilterProps {
    headerIndexes:headerIndex[];
    numColumns:number;
    layoutHeight:Reanimated.SharedValue<number>;
    headerHeight:number;
    sortCondition: 'day' | 'month';
    HEADER_HEIGHT: number;
    FOOTER_HEIGHT: number;
    indicatorHeight:number;
}


const FilterItem: React.FC<FilterItemProps> = (props) => {
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const SCREEN_WIDTH = useWindowDimensions().width;
    const visibleHeight = (SCREEN_HEIGHT-props.indicatorHeight-props.HEADER_HEIGHT-props.FOOTER_HEIGHT);

    const animatedStyle = useAnimatedStyle(()=>{
        return {
            transform: [
                {
                    translateY: (visibleHeight)*(props.sum/(props.layoutHeight.value-SCREEN_HEIGHT))
                }
            ]
          };
    });
    if(props.year !== ''){
        return (
            <Reanimated.View 
                style={[
                    styles.FilterItem, 
                    animatedStyle, 
                    {
                        borderRadius: SCREEN_WIDTH, 
                        right: SCREEN_WIDTH/2 - 75,
                    }
                ]} 
                key={'View_Year_'+props.year+'_'+new Date()+"_"+props.index}
            >
                <Text style={styles.FilterText}>
                    { props.year }
                </Text>
            </Reanimated.View>
        );
    }else{
        return <></>
    }
}

const Filter: React.FC<FilterProps> = (props) => {
    let sum:number = 0;
    const SCREEN_WIDTH = useWindowDimensions().width;
    const filteredHeaderIndexes = props.headerIndexes.filter(x=>x.sortCondition===props.sortCondition);
    return (
        <View>
        {
            filteredHeaderIndexes.map((filterItem:headerIndex, index:number) => {
                    let filterItem_t = (<FilterItem 
                        year={filterItem.yearStart} 
                        sum={sum} 
                        layoutHeight={props.layoutHeight} 
                        index={index}
                        headerHeight={props.headerHeight}
                        FOOTER_HEIGHT={props.FOOTER_HEIGHT}
                        HEADER_HEIGHT={props.HEADER_HEIGHT}
                        indicatorHeight={props.indicatorHeight}
                        key={'Year_'+filterItem.yearStart+'_'+new Date()+"_"+props.numColumns+"_"+Math.random()}
                    />);
                sum = sum + Math.ceil(filterItem.count/props.numColumns)*(SCREEN_WIDTH/props.numColumns);
                return filterItem_t;
            })
        }
        </View>
    )
}

const FloatingFilters: React.FC<Props> = (props) => {
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const SCREEN_WIDTH = useWindowDimensions().width;
    const visibleHeight = (SCREEN_HEIGHT-props.indicatorHeight-props.HEADER_HEIGHT-props.FOOTER_HEIGHT);
    useEffect(()=>{
        console.log([Date.now()+': component FloatingFilters'+props.numColumns+' rendered']);
    });
    
    const animatedStyle = useAnimatedStyle(()=>{
        return {
            opacity: props.floatingFiltersOpacity.value,
            zIndex: props.floatingFiltersOpacity.value,
          };
    });

    return (
        <Reanimated.View style={[styles.MainView, animatedStyle,{height: visibleHeight,width: SCREEN_WIDTH,top:(props.HEADER_HEIGHT)}]}>
            <Filter 
                headerIndexes={props.headerIndexes}
                numColumns={props.numColumns}
                layoutHeight={props.layoutHeight}
                headerHeight={props.headerHeight}
                sortCondition={props.sortCondition}
                FOOTER_HEIGHT={props.FOOTER_HEIGHT}
                HEADER_HEIGHT={props.HEADER_HEIGHT}
                indicatorHeight={props.indicatorHeight}
            />
        </Reanimated.View>
    );
}

const styles = StyleSheet.create({
    MainView : {
        position: 'absolute',
        flex: 1,
    },
    FilterItem:{
        position: 'absolute',
        backgroundColor: 'white',
        color: 'black',
        zIndex:1,
        opacity: 0.8,
        width: 100,
        height: 20,
        textAlign: 'center',
        borderColor: 'darkgrey',
        borderWidth: 0.1,
    },
    FilterText:{
        color: 'black',
        textAlign: 'center',
    }
});

const isEqual = (prevProps:Props, nextProps:Props) => {
    return (prevProps.indicatorHeight === nextProps.indicatorHeight && prevProps.numColumns === nextProps.numColumns);
}

export default React.memo(FloatingFilters, isEqual);