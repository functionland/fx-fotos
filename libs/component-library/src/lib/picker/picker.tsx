import React from 'react';
import { FxTheme } from '../theme';
import { Picker, PickerProps } from '@react-native-picker/picker';
import {
  TextProps,
  BoxProps,
  composeRestyleFunctions,
  textRestyleFunctions,
  boxRestyleFunctions,
  useRestyle,
} from '@shopify/restyle';
import { StyleProp, TextStyle } from 'react-native';

type FxPickerProps = TextProps<FxTheme> &
  BoxProps<FxTheme> &
  Omit<PickerProps, 'itemStyle' | 'style'>;

const restyleFunctions = composeRestyleFunctions<
  FxTheme,
  Omit<FxPickerProps, 'children'>
>([...textRestyleFunctions, ...boxRestyleFunctions]);

const FxPicker = ({ children, ...rest }: FxPickerProps) => {
  const { style, ...restProps } = useRestyle(restyleFunctions, rest);

  return (
    <Picker {...restProps} itemStyle={style as StyleProp<TextStyle>}>
      {children}
    </Picker>
  );
};

const FxPickerItem = Picker.Item;

export { FxPicker, FxPickerItem };
