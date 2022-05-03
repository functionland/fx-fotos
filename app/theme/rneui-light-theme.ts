import { createTheme, lightColors } from "@rneui/themed"
import { palette } from "./index"
export const RneLightTheme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
  Button: {
    raised: true,
  },
  Header: {
    containerStyle: {
      backgroundColor: palette.white,
    },
    statusBarProps: {
      backgroundColor: palette.white,
      barStyle: "dark-content",
    },
  },
  mode: "light",
})
