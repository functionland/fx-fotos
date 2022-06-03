/**
 * Example Button Component to demonstrate component library
 */

import React from 'react';
import {
  color,
  ColorProps,
  composeRestyleFunctions,
  useRestyle,
  useTheme,
} from '@shopify/restyle';
import { Button, ButtonProps } from 'react-native';
import { FxTheme } from '../theme';

type FxButtonProps = ButtonProps & ColorProps<FxTheme>;

const FxButton = ({ color = 'primary', ...rest }: FxButtonProps) => {
  const theme = useTheme<FxTheme>();
  let buttonColor = undefined;
  if (color) {
    buttonColor = theme.colors[color];
  }
  return <Button color={buttonColor} {...rest} />;
};

export { FxButton };
