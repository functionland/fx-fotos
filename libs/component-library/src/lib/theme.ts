import { createTheme } from '@shopify/restyle';

const palette = {
  purple: '#5A31F4',
  green: '#0A906E',
};

const fxLightTheme = createTheme({
  colors: {
    primary: palette.purple,
  },
  spacing: {
    s: 8,
    m: 16,
  },
  breakpoints: {},
});

type FxTheme = typeof fxLightTheme;

const fxDarkTheme: FxTheme = {
  ...fxLightTheme,
  colors: {
    primary: palette.green,
  },
};

export { FxTheme, fxLightTheme, fxDarkTheme };
