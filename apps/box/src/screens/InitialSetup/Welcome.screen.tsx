import { FxBox, FxButton, FxText } from '@functionland/component-library';
import React, { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, SafeAreaView, StyleSheet } from 'react-native';
import Reanimated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import { Logo } from '../../components/Icons';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { clamp, withBouncing } from 'react-native-redash';
import { useIsConnectedToBox } from '../../hooks/useIsConnectedToBox';
import { useInitialSetupNavigation } from '../../hooks/useTypedNavigation';

const ReanimatedBox = Reanimated.createAnimatedComponent(FxBox);

type Bounds = {
  low: number;
  high: number;
};

const LOGO_WIDTH = 105;
const LOGO_HEIGHT = 102;

export const WelcomeScreen = () => {
  const navigation = useInitialSetupNavigation();
  const isAndroid = Platform.OS === 'android';
  const [hasLocationPermission, setHasLocationPermission] = useState(
    !isAndroid
  );
  const [hasCheckedLocationPermission, setHasCheckedLocationPermission] =
    useState(!isAndroid);
  const isConnectedToBox = useIsConnectedToBox();

  const onConnectToBox = () => {
    if (hasLocationPermission) {
      if (isConnectedToBox) {
        navigation.navigate('Setup Wifi');
      } else {
        navigation.navigate('Connect To Box');
      }
    } else {
      /**
       * @todo: Add Location Permission screen or dialogue for android
       */
      // navigation.navigate('Location Permission');
    }
  };

  useEffect(() => {
    if (isAndroid && !hasLocationPermission) {
      (async () => {
        const isGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasLocationPermission(isGranted);
        setHasCheckedLocationPermission(true);
      })();
    }
  }, [isAndroid, hasLocationPermission, hasCheckedLocationPermission]);

  const boundsX = useSharedValue<Bounds>({ low: 0, high: 0 });
  const boundsY = useSharedValue<Bounds>({ low: 0, high: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const calcBounds = (
    layoutCoord: number,
    dim: number,
    lowCoord: number,
    highCoord: number
  ) => {
    const low = lowCoord - layoutCoord;
    const high = highCoord - (layoutCoord + dim);

    return [low, high];
  };

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {
      offsetX: number;
      offsetY: number;
    }
  >({
    onStart: (_, ctx) => {
      ctx.offsetX = translateX.value;
      ctx.offsetY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = clamp(
        ctx.offsetX + event.translationX,
        boundsX.value.low,
        boundsX.value.high
      );
      translateY.value = clamp(
        ctx.offsetY + event.translationY,
        boundsY.value.low,
        boundsY.value.high
      );
    },
    onEnd: ({ velocityX, velocityY }) => {
      translateX.value = withBouncing(
        withDecay({
          velocity: velocityX,
        }),
        boundsX.value.low,
        boundsX.value.high
      );
      translateY.value = withBouncing(
        withDecay({
          velocity: velocityY,
        }),
        boundsY.value.low,
        boundsY.value.high
      );
    },
  });
  const panStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: clamp(
            translateX.value,
            boundsX.value.low,
            boundsX.value.high
          ),
        },
        {
          translateY: clamp(
            translateY.value,
            boundsY.value.low,
            boundsY.value.high
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.flex1}>
      <FxText padding="m" textAlign="center" variant="body">
        Box Setup Up
      </FxText>
      <FxBox
        flex={3}
        marginHorizontal="m"
        justifyContent="center"
        alignItems="center"
        onLayout={(evt) => {
          const layout = evt.nativeEvent.layout;

          const logox = layout.x + layout.width / 2 - LOGO_WIDTH / 2;
          const logoy = layout.y + layout.height / 2 - LOGO_HEIGHT / 2;

          const xBounds = calcBounds(
            logox,
            LOGO_WIDTH,
            layout.x,
            layout.x + layout.width
          );
          const yBounds = calcBounds(
            logoy,
            LOGO_HEIGHT,
            layout.y,
            layout.y + layout.height
          );
          boundsX.value = { low: xBounds[0], high: xBounds[1] };
          boundsY.value = { low: yBounds[0], high: yBounds[1] };
        }}
      >
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <ReanimatedBox style={panStyle}>
            <Logo />
          </ReanimatedBox>
        </PanGestureHandler>
      </FxBox>
      <ReanimatedBox>
        <FxButton
          testID="app-name"
          onPress={() => navigation.navigate('Wallet Connect')}
        >
          Setup Wallet
        </FxButton>
      </ReanimatedBox>
      <ReanimatedBox>
      <FxButton
        testID="app-name"
        onPress={onConnectToBox}
        disabled={!hasCheckedLocationPermission}
      >
        Connect To Box
      </FxButton>
      </ReanimatedBox>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
