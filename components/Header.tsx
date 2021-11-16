import React, {useContext, useEffect} from 'react';
import {
	View,
	StyleSheet,
	Image,
	StatusBar
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
import {useRecoilValue} from "recoil";
import {HeaderVisibilityState} from '../states/layout'
import {ScrollContext} from "./Shared/ScrollContext";


interface Props {
	HEADER_HEIGHT: number;
}

const Header: React.FC<Props> = (props) => {
	useEffect(() => {
		console.log('HEADER mounted');
	});

	return (
		<View style={styles.container}>
			<Image
				source={require('../assets/images/logo30.png')}
				style={[styles.image, {bottom: props.HEADER_HEIGHT / 2}]}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	image: {
		// flex:1,
		marginTop:20,
		// position: 'absolute',
		// alignSelf: 'center',
	},
	container: {
		display: "flex",
		alignItems:"center",
		justifyContent:"center",
		
	}

});

export default React.memo(Header);