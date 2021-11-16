import {Text, View, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";
import {getDiffFunc} from "../../utils";
import {SectionHeader, SectionType} from "../../../../types/interfaces";
import moment from 'moment';

interface Props {
	data:SectionHeader
	big:boolean;
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
			let format = `ddd, MMM D${showYear?',YYYY':''}`
			let bigFormat = `MMMM${showYear?',YYYY':''}`
			setText(moment(props.data.timeStamp).format(format))
			setBigText(moment(props.data.timeStamp).format(bigFormat))
		}
	})

	return (
		<View style={{flex: 1, marginLeft:20, marginTop:10}}>
			{props.big && <Text style={styles.bigText}>{bigText}</Text>}
			<Text style={styles.smallText} >{text}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	bigText:{
		fontSize:25,
		fontWeight:'bold'
	},
	smallText:{
		fontSize:20
	}
})


export default SectionHeaderItem;