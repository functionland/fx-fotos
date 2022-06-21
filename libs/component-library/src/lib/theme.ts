import { createTheme } from '@shopify/restyle';

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

export { FxTheme, fxLightTheme, fxDarkTheme };
