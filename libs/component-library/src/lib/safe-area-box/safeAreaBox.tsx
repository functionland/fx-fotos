import { createBox } from '@shopify/restyle';
import { SafeAreaView } from 'react-native';
import { FxTheme } from '../theme/theme';

export const FxSafeAreaBox = createBox<FxTheme>(SafeAreaView);
