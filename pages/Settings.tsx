import React, {useEffect} from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, StatusBar } from 'react-native';
import SettingsContainer from '../components/SettingsContainer';
import {default as Reanimated,} from 'react-native-reanimated';

interface Props {
  navigation: any;
  route: {params:{HEADER_HEIGHT: number;FOOTER_HEIGHT: number;headerShown:Reanimated.SharedValue<number>;}}
}

const Settings: React.FC<Props> = (props) => {
  useEffect(()=>{
    console.log(Date.now()+': Settings re-rendered');
  });
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={[
				styles.View, 
				{
					width: SCREEN_WIDTH, 
					zIndex:1, 
					top:((StatusBar.currentHeight||0)+(2*props.route.params.HEADER_HEIGHT||0))
				}
			]}>
        <SettingsContainer 
          HEADER_HEIGHT={props.route.params.HEADER_HEIGHT} 
          FOOTER_HEIGHT={props.route.params.FOOTER_HEIGHT}
          headerShown={props.route.params.headerShown}
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
    position: 'relative',
    left: 0,
		flex: 1,
  }
});
const isEqual = (prevProps:Props, nextProps:Props) => {
  return (prevProps.route.params.HEADER_HEIGHT === nextProps.route.params.HEADER_HEIGHT);
}
export default React.memo(Settings, isEqual);
