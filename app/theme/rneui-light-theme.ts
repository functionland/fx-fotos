import { StatusBar } from 'react-native'
import { createTheme, lightColors } from '@rneui/themed'
import { palette, Constants } from './index'

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
      paddingTop: 0,
      height: Constants.HeaderHeight,
      top: 0,
      zIndex: 9999,
      position: 'absolute',
      marginTop: StatusBar.currentHeight,
      borderBottomWidth: 0,
    },
    centerContainerStyle: {
      height: Constants.HeaderHeight - StatusBar.currentHeight,
    },
    statusBarProps: {
      backgroundColor: palette.white,
      barStyle: 'dark-content',
    },
  },
  mode: 'light',
})
