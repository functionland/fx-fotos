import { createRestyleComponent, LayoutProps } from '@shopify/restyle';
import { View } from 'react-native';
import { FxTheme } from '../theme/theme';
import { layoutHeightFunc, layoutWidthFunc } from '../utils/restyle';

type FxSpacerProps = Pick<LayoutProps<FxTheme>, 'width' | 'height'>;

export const FxSpacer = createRestyleComponent<FxSpacerProps, FxTheme>(
  [layoutWidthFunc, layoutHeightFunc],
  View
);
