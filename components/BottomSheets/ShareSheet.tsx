import React, { useCallback, useMemo, useEffect,  } from 'react';
import { View, Text, StyleSheet, Animated, SectionListData, TouchableOpacity } from 'react-native';
import BottomSheet, { useBottomSheet, BottomSheetSectionList, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import {
	useRecoilState,
  } from 'recoil';
  import {contactsState} from '../../states';

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
	opacity: Animated.Value;
	FOOTER_HEIGHT: number;
	methods: {shareLink: Function, shareWithContact: Function}
}

const ShareSheet: React.FC<Props> = (props) => {
	useEffect(()=>{
		props.bottomSheetRef?.current?.close();
	}, [])
  // variables
  const snapPoints = useMemo(() => [-1, 300], []);

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
							'name': 'New contact',
							'icon': 'group-add',
							'key': 'newContact',
							'action': ()=>{props.methods.shareWithContact();}
						},
					]],
					key: '1'
        },
				{
          title: "Share to Apps",
          data: [[
						{
							'name': 'Create Link',
							'icon': 'add-link',
							'key': 'createLink',
							'action': props.methods.shareLink
						},
					]],
					key: '2'
        }
			];

	const renderSectionHeader = useCallback(
    ({ section } : {
			section: SectionListData<{
					name: string;
					icon: string;
					key: string;
					action: any;
			}[], {
					title: string;
					data: {
							name: string;
							icon: string;
							key: string;
							action: any
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
			icon: string;
			key: string;
			action: any;
	}}) => {
			console.log(item);
			return itemBuilder(item.name, item.icon, item.action)
    },
    []
  );

  const renderList = useCallback(
    ({ item }:{item:{
			name: string;
			icon: string;
			key: string;
			action: any;
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
	
	const itemBuilder = (name: string, icon: any, onPress: any) => {
		return (
			<TouchableOpacity 
			onPress={onPress}
        style={styles.itemContainer}
      >
				<View style={styles.itemContainer}>
            <MaterialIcons name={icon} size={40} color="blue" />
						<Text style={styles.itemText}>{name}</Text>
						</View>
      </TouchableOpacity>
		)
	}

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
		height: 100,
		flex: 1,
    flexDirection:'column',
		alignItems: 'center'
  },
	listContainer: {
		height: 100,
		width: '100%',
		borderBottomColor: 'lightgrey',
		borderBottomWidth: 1
  },
	itemText:{
    color: 'grey',
    position: 'relative',
    marginRight:5
  },
});

export default ShareSheet;