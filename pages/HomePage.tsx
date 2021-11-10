import React from 'react';

// import Photos from "../components/photos/Photos";
import {Text} from "react-native";

interface Props {
	HEADER_HEIGHT: number;
	FOOTER_HEIGHT: number;
}

const HomePage: React.FC<Props> = ({HEADER_HEIGHT,FOOTER_HEIGHT}) => {
	const Photos = React.lazy(() => import("../components/photos/Photos"));
	return (
		<React.Suspense fallback={<Text>loding</Text>}>
			<Photos HEADER_HEIGHT={HEADER_HEIGHT} FOOTER_HEIGHT={FOOTER_HEIGHT}/>
		</React.Suspense>
	);
};

export default React.memo(HomePage);
