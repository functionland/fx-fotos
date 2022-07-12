import { TextProps, VariantProps } from '@shopify/restyle';
import { FxTheme } from './theme';

type ButtonClassType = {
  // Variant that will be passed to button pressable
  button: VariantProps<FxTheme, 'buttonVariants'>;
  // theme definitions that will be passed to FxText
  text: VariantProps<FxTheme, 'textVariants'> &
    Pick<TextProps<FxTheme>, 'color'>;
};

export const FxButtonClasses: Record<'default' | 'inverted', ButtonClassType> =
  {
    default: {
      button: { variant: undefined },
      text: {
        variant: 'body',
        color: 'white',
      },
    },
    inverted: {
      button: { variant: 'inverted' },
      text: {
        variant: 'body',
        color: 'primary',
      },
    },
  };
