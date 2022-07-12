import { FxButton } from '@functionland/component-library';
import React from 'react';
import { FxBox } from '@functionland/component-library';
import {
  useInitialSetupNavigation,
  useRootNavigation,
} from '../../hooks/useTypedNavigation';

export const SetupCompleteScreen = () => {
  const navigation = useInitialSetupNavigation();
  const rootNavigation = useRootNavigation();
  return (
    <FxBox>
      <FxButton
        onPress={() =>
          rootNavigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
        }
      >
        Done
      </FxButton>
      <FxButton onPress={() => navigation.goBack()}>Back</FxButton>
    </FxBox>
  );
};
