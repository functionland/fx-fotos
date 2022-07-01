import {
  useRestyle,
  composeRestyleFunctions,
  backgroundColor,
  border,
  color,
  spacing,
} from '@shopify/restyle';
import { StyleProp, TextStyle } from 'react-native';
import { RestyleProps, FxTheme } from '../lib/theme';

const restyleFunctions = composeRestyleFunctions<FxTheme, RestyleProps>([
  backgroundColor,
  border,
  color,
  spacing,
]);

const useFxRestyle = (props: RestyleProps) => {
  return useRestyle(restyleFunctions, props) as { style: StyleProp<TextStyle> };
};

export { useFxRestyle };
