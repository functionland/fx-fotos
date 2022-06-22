import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  InitialSetupStackParamList,
  RootStackParamList,
} from '../navigation/navigatonConfig';

export const useRootNavigation = () =>
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();

export const useInitialSetupNavigation = () =>
  useNavigation<NativeStackNavigationProp<InitialSetupStackParamList>>();
