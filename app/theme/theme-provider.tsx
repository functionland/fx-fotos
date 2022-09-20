import React from 'react'
import { useColorScheme } from 'react-native'
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native'
import { useTheme } from '@rneui/themed'
import { RneLightTheme, RneDarkTheme } from '.'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext: React.Context<ThemeContextType> =
  React.createContext<ThemeContextType>({
    theme: DefaultTheme,
    toggleTheme: () => null,
  })

export function ThemeProvider({ children }) {
  const rneTheme = useTheme()
  const scheme = useColorScheme()

  const [theme, setTheme] = React.useState(() =>
    scheme === 'dark' ? DarkTheme : DefaultTheme,
  )

  const toggleTheme = React.useCallback(() => {
    const nextTheme = theme === DefaultTheme ? DarkTheme : DefaultTheme
    setTheme(nextTheme)
    rneTheme.replaceTheme(
      rneTheme.theme.mode === 'dark' ? RneLightTheme : RneDarkTheme,
    )
  }, [theme, rneTheme])

  const value = React.useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
