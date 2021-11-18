import * as React from 'react';
import {Appbar} from 'react-native-paper';
import {Image, StyleSheet, useWindowDimensions, View} from 'react-native';
import {ReText} from 'react-native-redash';
import {useRecoilState, useRecoilValue} from "recoil";
import {HeaderOptionsState, SelectModeState} from "../SharedState";
import {useEffect} from "react";
import {HeaderHeight} from "../Constants";
import {default as Reanimated, useDerivedValue, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';

interface Props {
}


const Header: React.FC<Props> = (props) => {
	const {width} = useWindowDimensions()
	const headerOptions = useRecoilValue(HeaderOptionsState)

	return (

		<Appbar style={[styles.appBar]}>
			{headerOptions.showLogo && <View style={{position: "absolute", width}}>
				<Image
					resizeMode={"contain"}
					style={{width: 80, alignSelf: "center"}}
					source={require('../../../assets/images/logo30.png')}/>
			</View>}
			{headerOptions.showBack && <Appbar.BackAction
				
			/>}
			{
				headerOptions.leftActions.map((action) => {
					return (<Appbar.Action
						key={action.name}
						color={action.color}
						icon={action.icon}
						onPress={() => {
							action.onPress();
						}}
						style={[]}
					/>);
				})
			}
			{headerOptions.leftCounter &&
			<ReText
				style={{color: 'grey'}}
				text={headerOptions.leftCounter}
			/>}
			<Appbar.Content title={''} subtitle=""/>
			{
				headerOptions.rightActions.map((action) => {
					return (<Appbar.Action
						key={action.name}
						color={action.color}
						icon={action.icon}
						onPress={() => {
							action.onPress();
						}}
						style={[]}
					/>);
				})
			}

		</Appbar>

	);
};

const styles = StyleSheet.create({
	appBar: {
		flex: 1,
		minHeight: HeaderHeight,
		maxHeight: HeaderHeight,
		backgroundColor: 'white'
	}
});

export default Header;