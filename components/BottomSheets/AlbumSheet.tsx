import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, SectionListData, TouchableOpacity, useWindowDimensions } from 'react-native';
import BottomSheet, { BottomSheetSectionList, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import {
	useRecoilState,
  } from 'recoil';
  import { albumsState } from '../../states';
  import { BottomSheetElement } from '../../types/interfaces';

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
	opacity: Animated.Value;
	FOOTER_HEIGHT: number;
	methods: {addToAlbum: Function, ChangeLastAlbumName: Function}
}

const AlbumSheet: React.FC<Props> = (props) => {
	const SCREEN_HEIGHT = useWindowDimensions().height;
	const [albums] = useRecoilState(albumsState);
	useEffect(()=>{
		props.bottomSheetRef?.current?.close();
	}, [])
  // variables
  const snapPoints = useMemo(() => [-1, 300, SCREEN_HEIGHT], []);

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

	const [sections, setSections] = useState( 
    [
		{
        	title: "Create",
        	data: [
						{
							'name': 'Album',
							'icon': 'photo-album',
							'key': 'newAlbum',
							'action': ()=>{}
						},
			],
			key: '1'
        },	
		{
        	title: "All Albums",
        	data: [],
			key: '2'
        }
	]);
	
	useEffect(() => {
		if(albums && albums.length>0 && sections && sections.length > 0){
			let section_t = sections;
			albums.map((album) => {
				section_t[1].data.push({
					'name': album.name,
					'icon': '',
					'key': album.name,
					action: () => {props.methods.addToAlbum(album.name);}
				});
			});
			setSections(section_t);
		}
	}, [albums, sections]);

	const renderSectionHeader = useCallback(
    ({ section } : {
			section: any}) => (
      <View style={styles.sectionHeaderContainer}>
        <Text>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderList = useCallback(
    ({ item }:{item:BottomSheetElement}) => {
		console.log(item);
		return (
		<View style={styles.listContainer}>
			<TouchableOpacity 
				onPress={item.action}
				style={styles.itemContainer}
			>
				<View style={styles.itemContainer}>
					<MaterialIcons name={item.icon as any} size={40} color="blue" />
					<Text style={styles.itemText}>{item.name}</Text>
				</View>
			</TouchableOpacity>
		</View>
		);
	},
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
	width: '100%',
	height: '100%',
	position: 'absolute',
	bottom: 0,
	right: 0,
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

export default AlbumSheet;