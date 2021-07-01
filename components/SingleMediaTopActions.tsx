import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet, Pressable } from 'react-native';
import { default as Reanimated, useSharedValue } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

interface Props {
  actionBarOpacity: Reanimated.SharedValue<number>;
  leftActions: Array<{icon:any;color:string;onPress:Function;name: string;}>;
  rightActions: Array<{icon:any;color:string;onPress:Function;name: string;}>;
  moreActions:Array<{icon:string;color:string;onPress:Function;name: string;}>;
  }
const SingleMediaTopActions: React.FC<Props> = (props) => {
  const animatedStyle = Reanimated.useAnimatedStyle(()=>{
    return {
        opacity: props.actionBarOpacity.value,
        top: props.actionBarOpacity.value?0:-200,
    };
  },[props.actionBarOpacity]);
  return (
    <Reanimated.View style={[styles.actionBar, animatedStyle]}>
        <View style={[styles.actionBar]}>
          {
            props.leftActions.map((action) => {
              return(<Pressable 
                onPress={()=>action.onPress()}
                style={[styles.actionBarIcon]} 
                key={action.name}
              >
                {action.icon!==''?<MaterialCommunityIcons name={action.icon} size={24} color={action.color} />:<View style={styles.separator}></View>}
              </Pressable>);
            })
          }
          <View style={styles.separator}></View>
          {
            props.rightActions.map((action) => {
              return(<Pressable 
                onPress={()=>action.onPress()}
                style={[styles.actionBarIcon]} 
                key={action.name}
              >
                {action.icon!==''?<MaterialCommunityIcons name={action.icon} size={24} color={action.color} />:<View style={styles.separator}></View>}
              </Pressable>);
            })
          }
        </View>
    </Reanimated.View>
  );
};
const styles = StyleSheet.create({
    actionBar: {
      zIndex:15,
      marginTop:0,
      backgroundColor: 'rgba(52, 52, 52, 0.2)',
      position: 'relative',
      top: 0,
      left: 0,
      height:'100%',
      width:'100%',
      flex:1,
      flexDirection:'row',
      flexWrap: 'wrap'
    },
    actionBarIcon: {
        zIndex: 25,
        height: '100%',
        width: 50,
        alignItems: 'center',
        alignContent:'center',
        flexDirection: 'column',
        alignSelf: 'center',
    },
    separator: {
      flex: 1
    }
  });
export default SingleMediaTopActions;