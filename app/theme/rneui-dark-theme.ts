import { StatusBar } from 'react-native'
import { createTheme, darkColors } from '@rneui/themed'

import { Constants } from '.'

export const RneDarkTheme = createTheme({
  darkColors: {
    ...Platform.select({
      default: darkColors.platform.android,
      ios: darkColors.platform.ios,
    }),
  },
  Button: {
    raised: true,
  },
  Header: {
    style: {
      borderWidth: 0,
    },
    containerStyle: {
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
  },
  mode: 'dark',
})
