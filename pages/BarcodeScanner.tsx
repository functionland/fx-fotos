import React, { useCallback, useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, Button, SectionListData, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import {
	useRecoilState,
  } from 'recoil';
  import {contactsState} from '../states';
  
interface Props {
  
}

const BarcodeScanner: React.FC<Props> = (props) => {
	const [hasPermission, setHasPermission] = useState<boolean>(false);
	const [scanned, setScanned] = useState(false);

	useEffect(() => {
		(async () => {
		const { status } = await BarCodeScanner.requestPermissionsAsync();
		setHasPermission(status === 'granted');
		})();
	}, []);

	const handleBarCodeScanned = ({ type, data }:{type:any;data:string}) => {
		setScanned(true);
		alert(`Bar code with type ${type} and data ${data} has been scanned!`);
	};
	
	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}
	
	return (
		<View style={styles.container}>
		  <BarCodeScanner
			onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
			style={StyleSheet.absoluteFillObject}
		  />
		  {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	}
});

export default BarcodeScanner;