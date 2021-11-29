import React, {ReactText, useEffect, useState} from "react";
import {Data, ItemType, SectionHeader, story} from "../../../../types/interfaces";
import {TouchableHighlight, View, StyleSheet} from "react-native";
import PhotoItem from "./PhotoItem";
import {Media} from "../../../../domian";
import VideoItem from "./VideoItem";
import StoriesItem from "./StoriesItem";
import SectionHeaderItem from "./SectionHeader";
import {MaterialIcons} from "@expo/vector-icons";
import {useRecoilState, useRecoilValue} from "recoil";
import {IsSelectedState, SelectModeState} from "../../SharedState";
import Header from "../../Shared/Header";

interface Props {
	type: ReactText,
	data: Data
}

const ListItem: React.FC<Props> = (props) => {
	
	const [selected,setSelected] = useRecoilState(IsSelectedState(props.data.id))
	const selectModeState = useRecoilValue(SelectModeState)
	
	const onLongPress = () => {
		setSelected(!selected)
	}

	const onPress = () => {
		console.log("wtf")
		if(selectModeState){
			setSelected(!selected)
		}
	}
	
	const getItemByType = (type: React.ReactText, data: Data) => {
		switch (type) {
			case ItemType.Header: {
				return (<Header/>)
			}
			case ItemType.Photo: {
				return (<PhotoItem data={data.value as Media}/>)
			}
			case ItemType.Video: {
				return (<VideoItem data={data.value as Media}/>)
			}
			case ItemType.Stories: {
				return (<StoriesItem data={data.value as story[]}/>)
			}
			case ItemType.SectionHeader: {
				return (<SectionHeaderItem data={data.value as SectionHeader} big={false} detail={true}/>)
			}
			case ItemType.SectionHeaderBig: {
				return (<SectionHeaderItem data={data.value as SectionHeader} big={true} detail={true}/>)
			}
			case ItemType.SectionHeaderMedium: {
				return (<SectionHeaderItem data={data.value as SectionHeader} big={true} detail={false}/>)
			}
			default:
				throw Error("Type Not provided")
		}
	}
	const backStyle = {
		flex: 1,
		margin:selected?8:0
	}

	return (
		<View style={{flex:1}}>
			{
				props.type === ItemType.Stories || props.type === ItemType.Header ?
					getItemByType(props.type, props.data) :
					<TouchableHighlight
						style={{flex: 1}}
						onLongPress={onLongPress}
						onPress={onPress}
						underlayColor='#dddddd'>
						<View style={backStyle}>
							{getItemByType(props.type, props.data)}
							<MaterialIcons style={[styles.checkBox,{opacity:selected?1:0}]} name="check" size={25} color="white"/>
						</View>
					</TouchableHighlight>
			}
		</View>

	);

}

const styles = StyleSheet.create({
	checkBox: {
		zIndex: 5,
		height: 20,
		position: 'absolute',
		bottom: 10,
		left: 10,
		flex: 1,
		flexDirection: 'row',
		color: 'white',
	}
})

export default ListItem