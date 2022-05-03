import React, { useCallback, useState } from 'react';
import { useColorScheme } from "react-native"
import { DefaultTheme, DarkTheme, Theme, } from '@react-navigation/native';
import { ThemeProvider as RneThemeProvider, createTheme, lightColors, darkColors } from '@rneui/themed';
import { RneLightTheme, RneDarkTheme } from "./"
export interface ThemeContextType {
    theme: Theme,
    toggleTheme: () => void
}
export const ThemeContext: React.Context<ThemeContextType> = React.createContext<ThemeContextType>({
    theme: DefaultTheme,
    toggleTheme: () => null,
});

export const ThemeProvider: React.FC = ({ children }) => {
    const scheme = useColorScheme();
    const [theme, setTheme] = useState(scheme === "dark" ? DarkTheme: DefaultTheme);
    const [rneTheme, setRneTheme] = useState(scheme === "dark" ? RneDarkTheme : RneLightTheme);

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === DefaultTheme ? DarkTheme : DefaultTheme;
        setTheme(nextTheme);
        setRneTheme(rneTheme.mode === "dark" ? RneLightTheme : RneDarkTheme)
    }, [theme, rneTheme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
            }}
        >
            <RneThemeProvider theme={rneTheme}>
                {children}
            </RneThemeProvider>
        </ThemeContext.Provider>
    );
};