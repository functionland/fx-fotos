import React from "react";
import FastImage from "react-native-fast-image";
import {Media} from "../../../../domian";
import {StyleSheet, View} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";


interface Props {
	data:Media
}

const PhotoItem: React.FC<Props> = (props) => {
	return(
		<View style={styles.container}>
			<FastImage
				style={styles.image}
				source={{
					uri: props.data.preview ? props.data.preview : props.data.uri,
					priority: FastImage.priority.normal,
				}}
				resizeMode={FastImage.resizeMode.stretch}
			/>

			<MaterialIcons style={[styles.uploadStatus,{opacity:props.data.hasCid?0:1}]} name="cloud-off" size={25} color="white"/>
		</View>

	)
}
const styles = StyleSheet.create({
	image:{
		flex: 1,
		backgroundColor: 'grey',
		margin: 2.5,
		zIndex: 4,
	},
	container:{
		flex:1
	},
	uploadStatus: {
		zIndex: 5,
		height: 20,
		position: 'absolute',
		bottom: 10,
		right: 10,
		flex: 1,
		flexDirection: 'row',
		color: 'white',
	},
})

export default PhotoItem;