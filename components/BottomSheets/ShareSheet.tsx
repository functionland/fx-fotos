import React, { useCallback, useMemo, useEffect,  } from 'react';
import { View, Text, StyleSheet, Animated, SectionListData } from 'react-native';
import BottomSheet, { useBottomSheet, BottomSheetSectionList, BottomSheetFlatList } from '@gorhom/bottom-sheet';

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
	opacity: Animated.Value;
	FOOTER_HEIGHT: number;
}

const ShareSheet: React.FC<Props> = (props) => {
	useEffect(()=>{
		props.bottomSheetRef?.current?.close();
	}, [])
  // variables
  const snapPoints = useMemo(() => [-1, 300+props.FOOTER_HEIGHT], [props.FOOTER_HEIGHT]);

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

	const sections = 
      [
				{
          title: "Send in Photos",
          data: [[
						{
							'name': 'test1',
							'key': 'test1'
						},
						{
							'name': 'test2',
							'key': 'test2'
						},
					]],
					key: '1'
        },
				{
          title: "Share to Apps",
          data: [[
						{
							'name': 'test10',
							'key': 'test10'
						},
						{
							'name': 'test20',
							'key': 'test20'
						},
					]],
					key: '2'
        }
			];

	const renderSectionHeader = useCallback(
    ({ section } : {
			section: SectionListData<{
					name: string;
					key: string;
			}[], {
					title: string;
					data: {
							name: string;
							key: string;
					}[][];
					key: string;
			}>}) => (
      <View style={styles.sectionHeaderContainer}>
        <Text>{section.title}</Text>
      </View>
    ),
    []
  );

	const renderItem = useCallback(
    ({ item }: {item: {
			name: string;
			key: string;
	}}) => {
			console.log(item);
			return (
      <View style={styles.itemContainer}>
        <Text>{item.name}</Text>
      </View>
    )},
    []
  );
  const renderList = useCallback(
    ({ item }:{item:{
			name: string;
			key: string;
	}[]}) => {
			console.log(item);
			return (
      <View style={styles.listContainer}>
        <BottomSheetFlatList
          data={item}
          keyExtractor={(item, index) => item.key+'_flatList'}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContentContainer}
					horizontal={true}
        />
      </View>
    )},
    []
  );

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
        <View style={styles.bottomSheetContainer}>
					<BottomSheetSectionList
						sections={sections}
						keyExtractor={(item, index) => index+'_sectionList'}
						renderSectionHeader={renderSectionHeader}
						renderItem={renderList}
						contentContainerStyle={styles.sectionListContentContainer}
					/>
        </View>
      </BottomSheet>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: 'rgba(52, 52, 52, 0.7)',
		zIndex: 7,
  },
  sectionListContentContainer: {
    flex: 1,
    alignItems: 'flex-start',
		paddingLeft: 5,
		paddingRight: 5
  },
	flatListContentContainer: {
    height: 100,
		width: '100%',
    alignItems: 'center',
  },
	bottomSheetContainer: {
		flex: 1,
    alignItems: 'center',
	},
	sectionHeaderContainer: {
		width: '100%',
		height: 30,
  },
  itemContainer: {
		width: 100,
		height: 100
  },
	listContainer: {
		height: 100,
		width: '100%',
		borderBottomColor: 'lightgrey',
		borderBottomWidth: 1
  },
});

export default ShareSheet;