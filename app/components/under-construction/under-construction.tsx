import React from "react"
import LottieView from 'lottie-react-native';

export const UnderConstruction = () => {
    return (
        <LottieView
            autoPlay={true}
            loop={true}
            source={require('../../../assets/lotties/under-construction.json')}
        />
    )
}

