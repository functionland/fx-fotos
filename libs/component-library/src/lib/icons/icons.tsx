import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  color: string;
  size: number;
};

export const FxChevronDownIcon = ({ color, size }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 7" fill="none">
      <Path
        d="M6 5.5L6.35355 5.85355L6 6.20711L5.64645 5.85355L6 5.5ZM11.3536 0.853553L6.35355 5.85355L5.64645 5.14645L10.6464 0.146447L11.3536 0.853553ZM5.64645 5.85355L0.646446 0.853554L1.35355 0.146447L6.35355 5.14645L5.64645 5.85355Z"
        fill={color}
      />
    </Svg>
  );
};
