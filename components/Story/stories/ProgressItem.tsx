import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {BAR_ACTIVE_COLOR, BAR_INACTIVE_COLOR} from '../utils/colors';
import {ProgressItemProps} from '../utils/interfaceHelper';
import {initialState, PROGRESS, progressReducer} from './ProgressReducer';
import {StyleSheet, View} from 'react-native';

let isValid = true;
let isBlock = false;

const OFFSET = 100;
const BAR_WIDTH = 100;
const BAR_HEIGHT = 7;

function ProgressItem(props: ProgressItemProps) {
  const [listener, setListener] = useState<any>();
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(listener);
    };
  }, [listener]);

  const blockProgress = useCallback(() => {
    clearTimeout(listener);
    isValid = false;
    isBlock = true;
  }, [listener]);
  // const [refreshProgress, setRefreshProgress] = useState(true)
  // const [progress, setProgress] = useState(0)

  const [state, dispatch] = useReducer(progressReducer, initialState);
  const {progress} = state;

  const barActiveColor =
    props.barStyle && props.barStyle.barActiveColor
      ? props.barStyle.barActiveColor
      : BAR_ACTIVE_COLOR;
  const barInActiveColor =
    props.barStyle && props.barStyle.barInActiveColor
      ? props.barStyle.barInActiveColor
      : BAR_INACTIVE_COLOR;
  const barWidth =
    props.barStyle && props.barStyle.barWidth
      ? props.barStyle.barWidth
      : BAR_WIDTH;
  const barHeight =
    props.barStyle && props.barStyle.barHeight
      ? props.barStyle.barHeight
      : BAR_HEIGHT;

  const startProgress = useCallback(() => {
    if (isMounted) {
      clearTimeout(listener);
      setListener(
        setTimeout(() => {
          if (isMounted) {
            // setProgress(progress + 1)
            dispatch({type: PROGRESS, payload: progress + 1});
          } else {
            clearTimeout(listener);
          }
        }, props.duration),
      );
    }
  }, [listener, progress, props.duration]);

  React.useEffect(() => {
    if (isMounted) {
      if (props.enableProgress) {
        if (progress >= 0 && progress < OFFSET) {
          if (progress === OFFSET - 2) {
            isValid = true;
          }
          if (!isBlock && isMounted) {
            startProgress();
          } else {
            isBlock = false;
            dispatch({type: PROGRESS, payload: progress + 1});
          }
        } else {
          if (isValid) {
            clearTimeout(listener);
            isValid = false;
            props.onChangePosition();
          }
        }
      } else {
        blockProgress();
      }
    }
  }, [
    blockProgress,
    listener,
    progress,
    props,
    props.enableProgress,
    startProgress,
  ]);

  React.useEffect(() => {
    if (isMounted) {
      clearTimeout(listener);
      if (props.enableProgress) {
        // This if condition is critical at it blocks the multiple callbacks for other position in row
        if (props.currentIndex === props.progressIndex) {
          if (props.progressIndex !== 0) {
            blockProgress();
            dispatch({type: PROGRESS, payload: 0});
            console.log('Progress Change => === ', props.progressIndex);
          } else {
            isValid = false;
            dispatch({type: PROGRESS, payload: 0});
          }
        }
      } else {
        blockProgress();
      }
    }
  }, [
    blockProgress,
    listener,
    props.currentIndex,
    props.enableProgress,
    props.progressIndex,
  ]);

  return (
    <View
      style={[
        styles.mainParent,
        {
          minWidth: `${barWidth / props.size - 1}%`,
          backgroundColor: barInActiveColor,
        },
      ]}>
      {props.currentIndex === props.progressIndex && (
        <View
          style={[
            styles.childActive,
            {
              width: `${progress}%`,
              height: barHeight,
              backgroundColor: barActiveColor,
            },
          ]}
        />
      )}

      {props.currentIndex !== props.progressIndex && (
        <View
          style={[
            styles.childInactive,
            {
              backgroundColor:
                props.currentIndex >= props.progressIndex
                  ? barInActiveColor
                  : barActiveColor,
              minWidth: `${barWidth / props.size - 1}%`,
              height: barHeight,
            },
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
  },
});
