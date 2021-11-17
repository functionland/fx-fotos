import {StyleSheet, Dimensions, StatusBar} from "react-native"

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const baseStyles = StyleSheet.create({
	HomePageSafeAreaView: {
		flex: 1,
		position: 'relative',
		backgroundColor: 'white'
	},
	HomePageView: {
		position: 'absolute',
		top: 0,
		left: 0,
		marginTop: StatusBar.currentHeight||0,
		width: SCREEN_WIDTH,
		zIndex: 1
	}
});