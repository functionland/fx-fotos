import {
  createTheme,
  BackgroundColorProps,
  ColorProps,
  TextProps,
  SpacingProps,
  BorderProps,
  VariantProps,
} from '@shopify/restyle';

type RestyleProps = BackgroundColorProps<FxTheme> &
  ColorProps<FxTheme> &
  TextProps<FxTheme> &
  SpacingProps<FxTheme> &
  BorderProps<FxTheme> &
  VariantProps<FxTheme, 'breakpoints'> &
  VariantProps<FxTheme, 'textVariants'>;

const palette = {
  purple: '#5A31F4',
  green: '#0A906E',
  white: 'white',
};

const fxLightTheme = createTheme({
  colors: {
    white: palette.white,
    primary: palette.purple,
    secondary: palette.green,
  },
  spacing: {
    s: 8,
    m: 16,
  },
  breakpoints: {},
  textVariants: {
    body: {
      fontSize: 16,
      color: 'primary',
    },
  },
  borderRadii: {
    s: 8,
    m: 16,
  },
});

type FxTheme = typeof fxLightTheme;

const fxDarkTheme: FxTheme = {
  ...fxLightTheme,
  colors: {
    white: 'white',
    primary: palette.green,
    secondary: palette.purple,
  },
};

export { FxTheme, fxLightTheme, fxDarkTheme, RestyleProps };
