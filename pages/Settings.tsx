import React, {useEffect} from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, StatusBar } from 'react-native';
import SettingsContainer from '../components/SettingsContainer';
import {default as Reanimated,} from 'react-native-reanimated';

interface Props {
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
}

const Settings: React.FC<Props> = (props) => {
  useEffect(()=>{
    console.log(Date.now()+': Settings re-rendered');
  });
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={[styles.View, {width: SCREEN_WIDTH, zIndex:1, marginTop:(StatusBar.currentHeight||0)}]}>
        <SettingsContainer 
          HEADER_HEIGHT={props.HEADER_HEIGHT} 
          FOOTER_HEIGHT={props.FOOTER_HEIGHT}
          headerShown={props.headerShown}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white'
  },
  View: {
    position: 'absolute',
    top: 0,
    left: 0
  }
});
export default React.memo(Settings);
