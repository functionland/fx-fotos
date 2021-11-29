import React from 'react';
import Photo from "../components/Photos/Photos";
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet} from "react-native";

const HomePage: React.FC = () => {
	return (
		<SafeAreaView style={styles.homeContainer}>
			<Photo/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	homeContainer: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center'
	}
})

export default HomePage;
