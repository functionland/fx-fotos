import React, { useEffect, useState, useRef, useReducer } from "react";
import { GREEN, GRAY, LIGHT_GRAY, LIGHT_GREEN, BAR_INACTIVE_COLOR, WHITE, BAR_ACTIVE_COLOR, } from "../utils/colors";
import { ProgressItemProps } from "../utils/interfaceHelper";
import { progressReducer, initialState, PROGRESS } from "./ProgressReducer";
import { View, StyleSheet, Animated, useWindowDimensions } from "react-native";

const OFFSET = 100
const BAR_WIDTH = 100
const BAR_HEIGHT = 7

function ProgressItem(props: ProgressItemProps) {
  const isMounted = useRef<boolean>(false);
  const listener = useRef<any>();
  const isBlock = useRef<boolean>(false);
  const isValid = useRef<boolean>(true);
  const SCREEN_WIDTH = useWindowDimensions().width;

  useEffect(() => {
    isMounted.current = true;
    return () => {isMounted.current = false;clearTimeout(listener.current);}
  }, []);

  var [state, dispatch] = useReducer(progressReducer, initialState);
  var { progress } = state;

  const barActiveColor = props.barStyle && props.barStyle.barActiveColor ? props.barStyle.barActiveColor : BAR_ACTIVE_COLOR
  const barInActiveColor = props.barStyle && props.barStyle.barInActiveColor ? props.barStyle.barInActiveColor : BAR_INACTIVE_COLOR
  const barWidth = props.barStyle && props.barStyle.barWidth ? props.barStyle.barWidth : BAR_WIDTH
  const barHeight = props.barStyle && props.barStyle.barHeight ? props.barStyle.barHeight : BAR_HEIGHT

  React.useEffect(() => {
      if (props.enableProgress) {
        if (progress >= 0 && progress < OFFSET) {
          if (progress == OFFSET - 2) {
            isValid.current = true
          }
          if (!isBlock.current) {
            startProgress()
          } else {
            isBlock.current = false
            dispatch({ type: PROGRESS, payload: progress + 1 })
          }
        } else {
          if (isValid.current) {
            clearTimeout(listener.current)
            isValid.current = false
            props.onChangePosition()
          }
        }
      } else {
        blockProgress()
      }
  }, [progress, props.enableProgress])

  React.useEffect(() => {
      clearTimeout(listener.current);
      if (props.enableProgress) {
        // This if condition is critical at it blocks the multiple callbacks for other position in row
        if (props.currentIndex === props.progressIndex) {
          if (props.progressIndex != 0) {
            blockProgress();
            dispatch({ type: PROGRESS, payload: 0 });
            ////console.log("Progress Change => === ", props.progressIndex);
          } else {
            isValid.current = false;
            dispatch({ type: PROGRESS, payload: 0 });
          }
        }
      } else {
        blockProgress();
      }
  }, [props.progressIndex])

  function startProgress() {
      clearTimeout(listener.current);
      listener.current = (setTimeout(() => {
          dispatch({ type: PROGRESS, payload: progress + 1 });
      }, props.duration));
  }

  function blockProgress() {
    clearTimeout(listener.current)
    isBlock.current = true
  }

  return (
    <View
      style={[
        styles.mainParent,
        {
          minWidth: (barWidth / props.size - 1)*(SCREEN_WIDTH-5)/100,
          backgroundColor: barInActiveColor,
        }
      ]}>

      {props.currentIndex === props.progressIndex && (
        <Animated.View
          style={[
            styles.childActive,
            {
              width: (barWidth / props.size - 1)*(SCREEN_WIDTH-5)/100,
              height: barHeight,
              backgroundColor: barActiveColor,
              transform:[
                {
                  scaleX: Animated.divide(progress,100)
                },
                {
                  translateX: Animated.divide(
                    Animated.subtract(
                    Animated.multiply(
                        Animated.divide(progress,100),(barWidth/props.size - 1)*(SCREEN_WIDTH-5)/100)
                    ,(barWidth/props.size - 1)*(SCREEN_WIDTH-5)/100
                    )
                  ,Animated.multiply(2,Animated.add(Animated.divide(progress,100), 0.000001)))

                }
              ]
            }]}
        />
      )}

      {(props.currentIndex != props.progressIndex) && (
        <View
          style={[
            styles.childInactive,
            {
              backgroundColor: props.currentIndex >= props.progressIndex ? barInActiveColor : barActiveColor,
              minWidth: `${barWidth / props.size - 1}%`,
              height: barHeight
            }
          ]}
        />
      )}
    </View>
  );
}

export default ProgressItem;

const styles = StyleSheet.create({
  mainParent: {
    // marginLeft: '0.5%',
    // marginRight: '0.5%',
    borderRadius: 20,
  },
  childActive: {
    borderRadius: 20,
  },
  childInactive: {
    borderRadius: 20,
  }
});
