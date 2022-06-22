/**
 * Example Button Component to demonstrate component library
 */

import React from 'react';
import { createBox } from '@shopify/restyle';
import { Pressable, PressableProps } from 'react-native';
import { FxTheme } from '../theme';
import { FxText } from '../text/text';

const FxButtonBase = createBox<FxTheme, PressableProps>(Pressable);

type FxButtonProps = React.ComponentProps<typeof FxButtonBase> & {
  children?: React.ReactNode | string;
};

const FxButton = ({ children, style, ...rest }: FxButtonProps) => {
  return (
    <FxButtonBase
      padding="m"
      margin="m"
      backgroundColor="primary"
      borderRadius="s"
      style={(args) => [
        typeof style === 'function' ? style(args) : style,
        args.pressed && {
          opacity: 0.5,
        },
      ]}
      {...rest}
    >
      <FxText variant="body" color="white">
        {children}
      </FxText>
    </FxButtonBase>
  );
};

export { FxButton };
