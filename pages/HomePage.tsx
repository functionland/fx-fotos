import React from 'react';
import Photo from "../components/Photos/Photos";
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet} from "react-native";
import Header from "../components/Photos/Shared/Header";

const HomePage: React.FC = () => {
	return (
		<SafeAreaView style={styles.homeContainer}>
			<Header/>
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
