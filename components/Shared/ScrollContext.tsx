import React, {createContext} from 'react';
import {useSharedValue} from "react-native-reanimated";
import {Animated} from "react-native";

export const ScrollContext = createContext(null)

export default function ScrollContextProvider(props:any) {
	return (
		<ScrollContext.Provider value={{
			scrollY: new Animated.Value(0),
			scrollYAnimated: useSharedValue(0)
		}}>
			{props.children}
		</ScrollContext.Provider>
	)
}