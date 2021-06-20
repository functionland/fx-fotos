import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { default as Reanimated } from 'react-native-reanimated';

interface Props {
  actionBarOpacity: Reanimated.SharedValue<number>;
  actions: Array<{icon:string;color:string;onPress:Function;name: string;}>;
  moreActions:Array<{icon:string;color:string;onPress:Function;name: string;}>;
  backAction: Function;
  }
const ActionBar: React.FC<Props> = (props) => {
  const animatedStyle = Reanimated.useAnimatedStyle(()=>{
    return {
        opacity: props.actionBarOpacity.value,
    };
  },[props.actionBarOpacity]);

  return (
    <Reanimated.View style={[styles.actionBar, animatedStyle]}>
        <Appbar.Header style={[styles.actionBar]}>
          <Appbar.BackAction onPress={()=>{props.backAction();}} />
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