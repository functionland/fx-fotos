import { FxButton } from '@functionland/component-library';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { useInitialSetupNavigation } from '../../hooks/useTypedNavigation';

export const WelcomeScreen = () => {
  const navigation = useInitialSetupNavigation();

  return (
    <SafeAreaView>
      <FxButton
        testID="app-name"
        onPress={() => navigation.navigate('Wallet Connect')}
      >
        Setup Wallet
      </FxButton>
    </SafeAreaView>
  );
};
