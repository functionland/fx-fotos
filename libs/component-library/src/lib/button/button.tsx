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
import { FxTheme } from '../theme';
import { FxText } from '../text/text';

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
  variant?: keyof typeof ButtonVariants;
  children?: React.ReactNode | string;
};

const FxButton = ({
  variant = 'default',
  children,
  style,
  ...rest
}: FxButtonProps) => {
  return (
    <FxButtonBase
      variant={ButtonVariants[variant].buttonVariant}
      padding="m"
      margin="m"
      borderRadius="s"
      style={(args) => [
        typeof style === 'function' ? style(args) : style,
        args.pressed && {
          opacity: 0.5,
        },
      ]}
      {...rest}
    >
      <FxText {...ButtonVariants[variant].text}>{children}</FxText>
    </FxButtonBase>
  );
};

type ButtonVariantType = {
  buttonVariant: React.ComponentProps<typeof FxButtonBase>['variant'];
  text: Pick<React.ComponentProps<typeof FxText>, 'variant' | 'color'>;
};

// BUTTON VARIANTS DEFINITIONS

const ButtonVariants: Record<'default' | 'inverted', ButtonVariantType> = {
  default: {
    buttonVariant: undefined,
    text: {
      variant: 'body',
      color: 'white',
    },
  },
  inverted: {
    buttonVariant: 'inverted',
    text: {
      variant: 'body',
      color: 'primary',
    },
  },
};

export { FxButton };
