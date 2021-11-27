import React from "react";
import PinchZoom from "./Shared/PinchZoom";
import VerticalList from "./List/VerticalList";


const Photos: React.FC = () => {
	return (
		<PinchZoom>
			<VerticalList/>
		</PinchZoom>
	)
}


export default Photos;

