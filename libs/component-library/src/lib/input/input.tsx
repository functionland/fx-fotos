import React from 'react';
import {
  composeRestyleFunctions,
  useRestyle,
  textRestyleFunctions,
  boxRestyleFunctions,
  TextProps,
  BoxProps,
} from '@shopify/restyle';
import { TextInput, TextInputProps } from 'react-native';
import { FxTheme } from '../theme/theme';

type FxTextInputProps = TextProps<FxTheme> & BoxProps<FxTheme> & TextInputProps;

const restyleFunctions = composeRestyleFunctions<FxTheme, FxTextInputProps>([
  ...textRestyleFunctions,
  ...boxRestyleFunctions,
]);

const FxTextInput = ({ ...rest }: FxTextInputProps) => {
  const props = useRestyle(restyleFunctions, rest);
  return <TextInput {...props} />;
};

export { FxTextInput };
