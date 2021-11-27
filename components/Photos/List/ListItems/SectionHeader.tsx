import {Text, View, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {getDiffFunc} from "../../utils";
import {SectionHeader, SectionType} from "../../../../types/interfaces";
import moment from 'moment';

interface Props {
	data:SectionHeader
	big:boolean;
	detail:boolean
}

const SectionHeaderItem: React.FC<Props> = (props:Props)=>{
	const [bigText,setBigText] = useState('')
	const [text,setText] = useState('')
	useEffect(()=>{
		const now = new Date();
		if(props.data.timeStamp === now){
			setText('now')
		}
		else {
			const showYear = !getDiffFunc(SectionType.Year)(now,props.data.timeStamp)
			let format = `ddd, MMM D${showYear?', YYYY':''}`
			let bigFormat = `MMMM${showYear?', YYYY':''}`
			setText(moment(props.data.timeStamp).format(format))
			setBigText(moment(props.data.timeStamp).format(bigFormat))
		}
	})

	return (
		<View style={styles.container}>
			{props.big && <Text style={styles.bigText}>{bigText}</Text>}
			{props.detail && <Text style={styles.smallText} >{text}</Text>}
		</View>
	)
}

const styles = StyleSheet.create({
	container : {
		flex: 1,
		display:"flex",
		flexDirection:"column",
		alignItems:"flex-start",
		justifyContent:"center",
		marginLeft:10,
		// marginTop:10
	},
	bigText:{
		fontSize:30,
		fontWeight:'bold',
	},
	smallText:{
		fontSize:23
	}
})


export default SectionHeaderItem;