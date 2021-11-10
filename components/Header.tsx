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
	const visibility = useRecoilValue(HeaderVisibilityState)
	const translateY = useSharedValue(0);
	const animScroll = useSharedValue<number>(0);
	const headerOpacity = useSharedValue(1)
	const scroll = useContext(ScrollContext)

	useDerivedValue(() => {
		animScroll.value = (scroll.scrollYAnimated.value );
	}, [scroll.scrollYAnimated.value]);

	useAnimatedReaction(() => {
		return animScroll.value;
	}, (result, previous) => {
		if (result !== previous) {
			const diff = (previous || 0) - result;
			translateY.value = interpolate(
				translateY.value + diff,
				[-props.HEADER_HEIGHT * 2, 0],
				[-props.HEADER_HEIGHT * 2, 0],
				Extrapolate.CLAMP
			);
		}
	}, [animScroll]);


	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{
				translateY: translateY.value,
			}],
			opacity: headerOpacity.value
		};
	});


	useEffect(() => {
		console.log('HEADER mounted');
	});

	useEffect(() => {
		headerOpacity.value = visibility ? 1 : 0
	}, [visibility])

	return (
		<Reanimated.View
			style={[styles.main, animatedStyle, {
				height: props.HEADER_HEIGHT + (StatusBar.currentHeight || 0),
				width: 400,
			}]}>
			<View style={styles.item}></View>
			<View style={styles.item}>
				<Image
					source={require('../assets/images/logo30.png')}
					style={[styles.image, {bottom: props.HEADER_HEIGHT / 2}]}
				/>
			</View>
		</Reanimated.View>
	)
}


const styles = StyleSheet.create({
	main: {
		flexDirection: 'row',
		flex: 1,
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
		flex: 1 / 3,
		backgroundColor: 'transparent',
		bottom: 0,
		height: '100%',
	},
	image: {
		position: 'absolute',
		alignSelf: 'center',
	},
	profilePic: {
		borderRadius: 35,
		width: 35,
		height: 35,
		backgroundColor: 'grey',
		alignSelf: 'center',
		marginTop: '10%'
	}
});

export default React.memo(Header);