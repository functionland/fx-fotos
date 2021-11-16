import FastImage from "react-native-fast-image";
import {StyleSheet, Text, View} from "react-native";
import {prettyTime} from "../../../../utils/functions";
import {MaterialIcons} from "@expo/vector-icons";
import React from "react";
import {Media} from "../../../../domian";


interface Props {
	data:Media
}

const VideoItem: React.FC<Props> = (props)=>{
	return (
		<>
			<FastImage
				source={{uri: props.data.uri}}
				// eslint-disable-next-line react-native/no-inline-styles
				style={{
					flex: 1,
					backgroundColor: 'white',
					margin: 2.5,
					zIndex: 4,
				}}
			/>
			<View
				style={styles.videoText}
			>
				<Text style={styles.durationText}>{prettyTime(props.data.duration)}</Text>
				<MaterialIcons name="play-circle-filled" size={20} color="white"/>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	durationText: {
		color: 'whitesmoke',
		position: 'relative',
		marginRight: 5
	},
	videoText: {
		zIndex: 4,
		height: 20,
		position: 'absolute',
		top: 5,
		right: 5,
		flex: 1,
		flexDirection: 'row',
	}
});

export default VideoItem