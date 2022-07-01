import {
  FxText,
  FxPicker,
  FxPickerItem,
  FxTextInput,
  FxButton,
} from '@functionland/component-library';
import React, { useState } from 'react';
import { SafeAreaView, Keyboard } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import { useInitialSetupNavigation, useFetch } from '../../hooks';
import { getWifiList, postWifiConnect } from '../../api/wifi';

export const SetupWifiScreen = () => {
  const navigation = useInitialSetupNavigation();
  const [ssid, setSsid] = useState<string>(null);
  const [password, setPassword] = useState('');
  const {
    loading,
    error,
    data: networks,
  } = useFetch({ apiMethod: getWifiList });
  const ssids = networks?.data.map(({ ssid }) => ssid);
  const uniqueSsids = [...new Set(ssids)];

  const onNetworkChange = (value) => setSsid(value);
  const onPasswordChange = (value) => setPassword(value);

  const onConnect = async () => {
    Keyboard.dismiss();
    try {
      await postWifiConnect({
        ssid: ssid ?? uniqueSsids[0],
        password,
        countryCode: RNLocalize.getCountry(),
      });
    } catch (err) {}

    navigation.navigate('Check Connection', { ssid: ssid ?? uniqueSsids[0] });
  };

  return (
    <SafeAreaView>
      {loading && (
        <FxText variant="body" color="secondary" margin="m">
          Loading Network List...
        </FxText>
      )}
      {error && (
        <FxText variant="body" color="secondary" margin="m">
          {error.message}
        </FxText>
      )}
      {!loading && !error && (
        <>
          <FxPicker
            backgroundColor="white"
            itemStyleColor="primary"
            selectedValue={ssid ?? uniqueSsids[0]}
            onValueChange={onNetworkChange}
          >
            {uniqueSsids.map((ssid) => (
              <FxPickerItem key={ssid} label={ssid} value={ssid} />
            ))}
          </FxPicker>
          <FxTextInput
            margin="m"
            padding="m"
            textAlign="center"
            color="primary"
            backgroundColor="white"
            borderRadius="s"
            secureTextEntry={true}
            placeholder="Password"
            value={password}
            onChangeText={onPasswordChange}
          />
          <FxButton testID="app-name" onPress={onConnect} alignItems="center">
            Connect
          </FxButton>
        </>
      )}
    </SafeAreaView>
  );
};
