import React, {useEffect} from "react";
import {useRecoilCallback, useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState} from "recoil";
import {HeaderOptionsState, SelectCounterState, SelectModeState} from "../SharedState";
import {ReText} from "react-native-redash";
import {useSharedValue} from "react-native-reanimated";


interface Props {
	
}

const SelectedItems: React.FC<Prop> = () => {
	const setHeaderOptions = useSetRecoilState(HeaderOptionsState)
	const resetHeaderOptions = useResetRecoilState(HeaderOptionsState)
	const [selectMode, setSelectMode] = useRecoilState(SelectModeState)
	const selectedCounter = useRecoilValue(SelectCounterState)
	const numberSelected = useSharedValue(selectedCounter.toString());
	useEffect(()=>{
		if(!selectMode){
			resetHeaderOptions()
		}else{
			setHeaderOptions((currVale)=>{
				return {
					...currVale,
					showLogo:false,
					leftActions:[{
						key:'unselect',
						color:'black',
						icon:'close',
						onPress:()=>{setSelectMode(false)}
					}],
					rightActions:[],
					leftCounter:numberSelected
				}
			})
		}
	},[selectMode])
	useEffect(()=>{
		numberSelected.value = selectedCounter.toString()
	},[selectedCounter])

	return(<></>)
}


export default SelectedItems