import React, { useCallback, useMemo, useEffect,  } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import BottomSheet, { useBottomSheet } from '@gorhom/bottom-sheet';

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
	opacity: Animated.Value;
}

const ShareSheet: React.FC<Props> = (props) => {
	useEffect(()=>{
		props.bottomSheetRef?.current?.close();
	}, [])
  // variables
  const snapPoints = useMemo(() => [-1, '30%', '60%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
		if(index===0){
			props.opacity.setValue(0);
			props.bottomSheetRef?.current?.close();
		}else{
			props.opacity.setValue(1);
		}
  }, []);

  // renders
  return (
    <Animated.View 
			style={[
				styles.container,
				{
					opacity: props.opacity,
					zIndex: Animated.multiply(7, props.opacity),
					transform: [
						{
							scale: props.opacity
						}
					]
				}
			]}
		>
      <BottomSheet
        ref={props.bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(52, 52, 52, 0.7)',
		zIndex: 7,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default ShareSheet;