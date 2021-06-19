import * as React from 'react';
import PropTypes from 'prop-types';
import { Animated, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { default as Reanimated, useSharedValue } from 'react-native-reanimated';

const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
interface Props {
  onValueChange: Function;
  icon: 'check';
  size: number;
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
  checked: Reanimated.SharedValue<0 | 1>;
}

const RoundCheckbox: React.FC<Props> = (props) => {


    const { size, backgroundColor, borderColor, icon, iconColor } = props;
    const iconSize = size * 1.3;
    const animatedStyle = Reanimated.useAnimatedStyle(()=>{
      return {
          opacity: Reanimated.withTiming(
            props.checked.value,
            {
              duration: 300
            }
          ),
          transform: [
            {
              scale: Reanimated.withTiming(
                props.checked.value,
                {
                  duration: 300
                }
              )
            }
          ]
      };
    });
  
    const animatedStyle2 = Reanimated.useAnimatedStyle(()=>{
      return {
          opacity: Reanimated.interpolate(
            props.checked.value,
            [0, 0.9],
            [1, 0]
          ),
      };
    });

    const bothStyles = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };

    const _onPress = () => {
      //props.onValueChange(!props.checked.value);
    };

    return (
      <TouchableWithoutFeedback hitSlop={hitSlop} onPress={_onPress}>
        <View style={styles.parentWrapper} shouldRasterizeIOS={true}>
          <Reanimated.View
            style={[
              {
                borderColor,
                backgroundColor: 'transparent',
                width: size,
                height: size,
                borderRadius: size / 2,
              },
              styles.commonWrapperStyles,
              animatedStyle2
            ]}
          />
          <Reanimated.View style={
            [
              {
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
              styles.checkedStyles, styles.commonWrapperStyles, animatedStyle
            ]}>
            <MaterialIcons
              name={icon}
              color={iconColor}
              size={Math.ceil(iconSize/1.5)}
              style={{
                height: iconSize,
                backgroundColor: 'transparent',
                alignSelf: 'center',
                textAlignVertical:'center'
              }}
            />
          </Reanimated.View>
        </View>
      </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
  parentWrapper: {
    position: 'relative',
  },
  commonWrapperStyles: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedStyles: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});

export default RoundCheckbox;