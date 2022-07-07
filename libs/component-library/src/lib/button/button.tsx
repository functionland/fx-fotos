/**
 * Example Button Component to demonstrate component library
 */

import React from 'react';
import {
  createBox,
  createRestyleComponent,
  createVariant,
  VariantProps,
} from '@shopify/restyle';
import { Pressable, PressableProps } from 'react-native';
import { FxTheme } from '../theme/theme';
import { FxText } from '../text/text';
import { FxButtonClasses } from '../theme/buttonClasses';

const buttonVariant = createVariant({ themeKey: 'buttonVariants' });
const PressableBox = createBox<FxTheme, PressableProps>(Pressable);

const FxButtonBase = createRestyleComponent<
  React.ComponentProps<typeof PressableBox> &
    VariantProps<FxTheme, 'buttonVariants'>,
  FxTheme
>([buttonVariant], PressableBox);

type FxButtonProps = Omit<
  React.ComponentProps<typeof FxButtonBase>,
  'variant'
> & {
  buttonClass?: keyof typeof FxButtonClasses;
  children?: React.ReactNode | string;
};

const FxButton = ({
  buttonClass = 'default',
  children,
  style,
  ...rest
}: FxButtonProps) => {
  return (
    <FxButtonBase
      {...FxButtonClasses[buttonClass].button}
      padding="m"
      margin="m"
      alignItems="center"
      borderRadius="s"
      style={(args) => [
        typeof style === 'function' ? style(args) : style,
        args.pressed && {
          opacity: 0.5,
        },
      ]}
      {...rest}
    >
      <FxText {...FxButtonClasses[buttonClass].text}>{children}</FxText>
    </FxButtonBase>
  );
};

export { FxButton };
