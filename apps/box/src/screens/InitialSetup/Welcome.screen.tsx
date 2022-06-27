import { FxBox, FxButton, FxText } from '@functionland/component-library';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useInitialSetupNavigation } from '../../hooks/useTypedNavigation';
import Reanimated, { FadeIn } from 'react-native-reanimated';

const ReanimatedBox = Reanimated.createAnimatedComponent(FxBox);

export const WelcomeScreen = () => {
  const navigation = useInitialSetupNavigation();

  return (
    <SafeAreaView style={styles.flex1}>
      <FxBox flex={3} justifyContent="center" alignItems="center">
        <FxText variant="body">Welcome Box Setup App</FxText>
      </FxBox>
      <ReanimatedBox
        flex={1}
        justifyContent="center"
        entering={FadeIn.duration(1000)}
      >
        <FxButton
          testID="app-name"
          onPress={() => navigation.navigate('Wallet Connect')}
        >
          Setup Wallet
        </FxButton>
      </ReanimatedBox>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
