import React from 'react'
import LottieView from 'lottie-react-native'

export function UnderConstruction() {
  return (
    <LottieView
      autoPlay
      loop
      source={require('../../../assets/lotties/under-construction.json')}
    />
  )
}
