import { createTheme, darkColors } from "@rneui/themed"

export const RneDarkTheme = createTheme({
  darkColors: {
    ...Platform.select({
      default: darkColors.platform.android,
      ios: darkColors.platform.ios,
    })
  },
  Button: {
    raised: true,
  },
  mode: "dark",
})
