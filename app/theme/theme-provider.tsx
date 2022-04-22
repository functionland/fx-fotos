import React, { useCallback, useState } from 'react';
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
export interface ThemeContextType {
    theme: Theme,
    toggleTheme: () => void
}
export const ThemeContext: React.Context<ThemeContextType> = React.createContext<ThemeContextType>({
    theme: DefaultTheme,
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC = ({ children }) => {
    const [theme, setTheme] = useState(DefaultTheme);

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === DefaultTheme ? DarkTheme : DefaultTheme;
        setTheme(nextTheme);
    }, [theme]);

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