import React from "react";
import Lottie from "react-lottie-player";

interface LottieAnimationProps {
  animation: any;
  height?: number;
}

/*
 * Wrapper for animations exported from AfterEffects.
 */
export default function LottieAnimation({
  animation,
  height,
}: LottieAnimationProps) {
  return <Lottie animationData={animation} style={{ height }} play />;
}
