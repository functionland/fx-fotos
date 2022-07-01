import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { RestyleProps } from '../theme';
import { useFxRestyle } from '../../hooks/useFxRestyle';

type FxTextInputProps = RestyleProps & TextInputProps;

const FxTextInput = ({ ...rest }: FxTextInputProps) => {
  const props = useFxRestyle(rest);
  return <TextInput {...props} />;
};

export { FxTextInput };
