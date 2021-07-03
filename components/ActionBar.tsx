import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { default as Reanimated, useSharedValue } from 'react-native-reanimated';
import { ReText } from 'react-native-redash';

interface Props {
  actionBarOpacity: Reanimated.SharedValue<number>;
  actions: Array<{icon:string;color:string;onPress:Function;name: string;}>;
  moreActions:Array<{icon:string;color:string;onPress:Function;name: string;}>;
  backAction: Function;
  selectedAssets:Reanimated.SharedValue<string[]>;
  lastSelectedAssetId: Reanimated.SharedValue<string>;
  lastSelectedAssetAction: Reanimated.SharedValue<number>;
  }
const ActionBar: React.FC<Props> = (props) => {
  const animatedStyle = Reanimated.useAnimatedStyle(()=>{
    return {
        opacity: props.actionBarOpacity.value,
        top: props.actionBarOpacity.value?0:-200
    };
  },[props.actionBarOpacity]);

  const numberSelected = useSharedValue('');
  Reanimated.useDerivedValue(() => {
    //we need to add a dummy condition on the props.lastSelectedAssetAction.value and props.lastSelectedAssetIndex.value so that useDerivedValue does not ignore updating
    if(props.lastSelectedAssetAction.value>-1 && props.lastSelectedAssetId.value!=='Thisisjustadummytext'){
      if(props.selectedAssets.value.length){
        numberSelected.value = ''+props.selectedAssets.value.length;
      }else{
        numberSelected.value = '';
      }
    }

  }, [props.lastSelectedAssetAction, props.lastSelectedAssetId]);
  return (
    <Reanimated.View style={[styles.actionBar, animatedStyle]}>
        <Appbar.Header style={[styles.actionBar]}>
          <Appbar.Action 
                key='back'
                color='black'
                icon='close'
                onPress={()=>{props.backAction();}} 
                style={[styles.actionBarIcon]} 
              />
          <ReText 
            style={{color: 'grey'}}
            text={numberSelected}
          />
          <Appbar.Content title="" subtitle="" />
          {
            props.actions.map((action) => {
              return(<Appbar.Action 
                key={action.name}
                color={action.color}
                icon={action.icon}
                onPress={()=>{action.onPress();}} 
                style={[styles.actionBarIcon]} 
              />);
            })
          }
          
        </Appbar.Header>
    </Reanimated.View>
  );
};
const styles = StyleSheet.create({
    actionBar: {
      zIndex:10,
      marginTop:0,
      backgroundColor: 'white',
    },
    actionBarIcon: {
        
    }
  });
export default ActionBar;