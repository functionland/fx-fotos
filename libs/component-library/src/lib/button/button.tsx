/**
 * Example Button Component to demonstrate component library
 */

import React from 'react';
import { ColorProps, useTheme } from '@shopify/restyle';
import { Button, ButtonProps } from 'react-native';
import { FxTheme } from '../theme';

type FxButtonProps = ButtonProps & ColorProps<FxTheme>;

const FxButton = ({ color = 'primary', ...rest }: FxButtonProps) => {
  const theme = useTheme<FxTheme>();
  const buttonColor = color ? theme.colors[color] : undefined;

  return <Button color={buttonColor} {...rest} />;
};

export { FxButton };
