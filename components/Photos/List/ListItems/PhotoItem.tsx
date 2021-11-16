import React from "react";
import FastImage from "react-native-fast-image";
import {Media} from "../../../../domian";


interface Props {
	data:Media
}

const PhotoItem: React.FC<Props> = (props) => {
	return(
		<FastImage
			style={{
				flex: 1,
				backgroundColor: 'grey',
				margin: 2.5,
				zIndex: 4,
			}}
			source={{
				uri: props.data.preview ? props.data.preview : props.data.uri,
				priority: FastImage.priority.normal,
			}}
			resizeMode={FastImage.resizeMode.stretch}
		/>
	)
}

export default PhotoItem;