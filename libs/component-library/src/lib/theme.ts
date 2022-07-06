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
  green: '#06B597',
  blue: '#187AF9',
  white: 'white',
  gray0: '#212529',
};

const fxLightTheme = createTheme({
  colors: {
    white: palette.white,
    primary: palette.green,
    secondary: palette.blue,
    background: palette.gray0,
  },
  spacing: {
    s: 8,
    m: 16,
  },
  breakpoints: {},
  textVariants: {
    defaults: {},
    body: {
      fontSize: 16,
      color: 'primary',
    },
  },
  borderRadii: {
    s: 8,
    m: 16,
  },
  zIndices: {},
});

type FxTheme = typeof fxLightTheme;

const fxDarkTheme: FxTheme = {
  ...fxLightTheme,
  colors: {
    white: 'white',
    primary: palette.green,
    secondary: palette.blue,
    background: palette.gray0,
  },
};

export { FxTheme, fxLightTheme, fxDarkTheme, RestyleProps };
