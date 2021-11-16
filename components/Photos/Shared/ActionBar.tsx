import * as React from 'react';
import { Appbar } from 'react-native-paper';
import {StatusBar, StyleSheet, useWindowDimensions} from 'react-native';
import { default as Reanimated, useSharedValue, useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import { ReText } from 'react-native-redash';
import {useRecoilCallback, useRecoilState, useRecoilValue} from "recoil";
import {SelectedItemsState} from "../SharedState";
import {useEffect} from "react";
import {HeaderVisibilityState} from "../../../states/layout";

interface Props {
	actions: Array<{icon:string;color:string;onPress:Function;name: string;}>;
	moreActions:Array<{icon:string;color:string;onPress:Function;name: string;}>;
}
const ActionBar: React.FC<Props> = (props) => {
	const [selectedItems,setSelectedOption] = useRecoilState(SelectedItemsState);
	const [mainHeaderVisibility,setMainHeaderVisibility] =useRecoilState(HeaderVisibilityState) 
	const {width} = useWindowDimensions()
	const numberSelected = useSharedValue('');
	useEffect(()=>{
		if(Object.keys(selectedItems).length>0){
			setMainHeaderVisibility(false)
		}else {
			setMainHeaderVisibility(true)
		}
		numberSelected.value = Object.keys(selectedItems).length.toString()
	},[selectedItems])

	const onClosePress = ()=>{
		console.log("segee");
		setMainHeaderVisibility(true);
		setSelectedOption([])
	} 
	return (
		<>
			{!mainHeaderVisibility && <Appbar style={[styles.actionBar,{width:width}]}>
				<Appbar.Action
					key='back'
					color='black'
					icon='close'
					onPress={onClosePress}
				/>
				<ReText
					style={{color: 'grey'}}
					text={numberSelected}
				/>
				<Appbar.Content title="" subtitle="" />
				{
					props.actions.map((action) => {
						return(<Appbar.Action
							key={action.name}
							color={action.color}
							icon={action.icon}
							onPress={()=>{action.onPress();}}
							style={[]}
						/>);
					})
				}

			</Appbar>}

		</>

	);
};
const styles = StyleSheet.create({
	actionBar: {
		opacity:1,
		position: 'relative',
		left: 0,
		marginTop: (StatusBar.currentHeight||0),
		backgroundColor: 'white',
	},
});
export default ActionBar;