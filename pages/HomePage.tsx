import React, {useEffect} from 'react';
import Photo from "../components/Photos/Photos";
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet} from "react-native";


interface Props {
	navigation:any;
}

const HomePage: React.FC<Props> = ({navigation}) => {
	useEffect(()=>{
		console.log('are u working')
	})
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
