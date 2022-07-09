import React, { useCallback, useState } from 'react';
import { useColorScheme } from "react-native"
import { DefaultTheme, DarkTheme, Theme, } from '@react-navigation/native';
import { useTheme } from '@rneui/themed';
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
    const [theme, setTheme] = useState(scheme === "dark" ? DarkTheme : DefaultTheme);
    const rneTheme = useTheme()

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === DefaultTheme ? DarkTheme : DefaultTheme;
        setTheme(nextTheme);
        rneTheme.replaceTheme(rneTheme.theme.mode === "dark" ? RneLightTheme : RneDarkTheme)
    }, [theme, rneTheme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};