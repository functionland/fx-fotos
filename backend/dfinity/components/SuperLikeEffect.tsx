import React, { useEffect, useState } from "react";
import LottieAnimation from "./LottieAnimation";
import SuperLikeAnim from "../assets/animations/Superlike-single.json";
import SuperLikeAnimIcon from "../assets/animations/Superlike-icon.json";
import "./SuperLikeEffect.scss";

/*
 * This uses the wrapped Lottie animation component to display the effect
 */
export function SuperLikeEffect({ isActive = false }) {
  const [mainAnimActive, setMainAnimActive] = useState(isActive);
  const [secondAnimActive, setSecondAnimActive] = useState(false);

  useEffect(() => {
    const timeoutMain = setTimeout(() => {
      setMainAnimActive(false);
      if (isActive) {
        setSecondAnimActive(true);
      }
    }, 1000);
    const timeoutSecondary = setTimeout(() => {
      setSecondAnimActive(false);
    }, 1500);

    if (isActive) {
      setMainAnimActive(true);
    }

    return () => {
      clearTimeout(timeoutMain);
      clearTimeout(timeoutSecondary);
    };
  }, [isActive]);

  const iconPositionInAnimation = 766;
  let animationPosition = {
    x: -175,
    y: window.innerHeight / 2 - iconPositionInAnimation / 2,
  };
  if (secondAnimActive) {
    animationPosition = {
      x: 0,
      y: window.innerHeight - iconPositionInAnimation,
    };
  }

  const animationStyling = {
    transform: `translate(${animationPosition.x}px, ${animationPosition.y}px)`,
  };

  return (
    <div id="superLikeEffectContainer">
      {mainAnimActive && (
        <LottieAnimation height={876} animation={SuperLikeAnim} />
      )}
      <div className="superLikeSecondAnimation" style={animationStyling}>
        {secondAnimActive && (
          <LottieAnimation height={876} animation={SuperLikeAnimIcon} />
        )}
      </div>
    </div>
  );
}
