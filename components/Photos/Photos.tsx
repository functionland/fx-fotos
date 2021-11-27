import React from "react";
import PinchZoom from "./Shared/PinchZoom";
import VerticalList from "./List/VerticalList";


interface Props {
}

const Photos: React.FC<Props> = (props) => {


	return (
		<PinchZoom>
			<VerticalList/>
		</PinchZoom>
	)
}


export default Photos;

