import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useTheme } from '@shopify/restyle';
import { FxTheme } from '@functionland/component-library';

type NavContainerProps = {
  children?: React.ReactNode | string;
};

export const NavContainer = ({ children }: NavContainerProps) => {
  const theme = useTheme<FxTheme>();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: theme.colors.background },
      }}
    >
      {children}
    </NavigationContainer>
  );
};
