import AuthProvidersClass from '../Auth';
import React, {useEffect, } from 'react';
import { 
    View, 
    StyleSheet, 
    Image, 
    StatusBar,
    Pressable,
	Text
} from 'react-native';
import * as Progress from 'react-native-progress';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import QRCode from 'react-native-qrcode-svg';

import {
	useRecoilState,
  } from 'recoil';
  import {
	identityState, 
  } from '../../states';
  import {default as Reanimated,} from 'react-native-reanimated';

interface Props {
    navigation: any;
	HEADER_HEIGHT: number;
    headerShown: Reanimated.SharedValue<number>;
}
const Auth: React.FC<Props> = (props) => {
	const chartConfig = {
		backgroundGradientFrom: "#1E2923",
		backgroundGradientFromOpacity: 0,
		backgroundGradientTo: "#08130D",
		backgroundGradientToOpacity: 0.5,
		color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
		strokeWidth: 2, // optional, default 3
		barPercentage: 0.5,
		useShadowColorFromDataset: false // optional
	};
	const [identity, setIdentity] = useRecoilState(identityState);
	//TODO: Fix this class
	const authProvidersClass = new AuthProvidersClass(identity);
	const processLogin = async (data:any) => {
		let result = await data;
		authProvidersClass.setIdentity(result);
		setIdentity([result]);
	}
	const disconnectIdentity = () => {
		setIdentity([]);
	}
	const authProviders = authProvidersClass.authenticate(disconnectIdentity, processLogin);

	const backendProviders = [{
		name: 'Dfinity',
		key: 'Dfinity',
		action: ()=>{},
		link: ''
	}];

	let _menu: { hide: () => void; show: () => void; } | null = null;

    const setMenuRef = (ref: any) => {
        _menu = ref;
    };

    const hideMenu = () => {
    	_menu?.hide();
    };

    const showMenu = () => {
        _menu?.show();
    };
	return (

		<Menu
			ref={setMenuRef}
			button={
				<Pressable style={[styles.profilePic, {backgroundColor:(identity && identity[0]?.success)?'green':'grey'}]} onPress={showMenu}></Pressable>
			}
		>
                            {
                                authProviders.map(x => (
                                    <MenuItem 
                                        onPress={
                                            ()=>{
                                                if(x.link){
                                                    props.navigation.navigate('Browser', {
                                                        title: x.name, 
                                                        link: x.link
                                                    })
                                                }else{
                                                    x.action();
                                                }
                                                hideMenu();
                                            }
                                        } 
                                        key={x.key}>
                                            {x.name}
                                        </MenuItem>
                                    )
                                )
                            }
							<MenuDivider />
							{
                                (identity && identity[0]?.success) && backendProviders.map(x => (
                                    <MenuItem 
                                        onPress={
                                            ()=>{
                                                if(x.link){
                                                    props.navigation.navigate('Browser', {
                                                        title: x.name, 
                                                        link: x.link
                                                    })
                                                }else{
                                                    x.action();
                                                }
                                                hideMenu();
                                            }
                                        } 
                                        key={x.key}
										style={{
											alignItems: 'flex-start',
											display: 'flex',
											justifyContent: 'center',
											paddingTop: 10
										}}
									>
										<View style={{flex:1, flexDirection:'row', width:'100%',}}>
                                            <View style={{flex:1/2,}}>
												<Text>
													{x.name}
												</Text>
											</View>
											<View style={{flex:1/2,}}>
												<Progress.Bar progress={0.3} width={100} />
											</View>
										</View>
                                    </MenuItem>
                                )
                                )
                            }
							<MenuDivider />
							<MenuItem 
                                onPress={
                                    ()=>{
                                        props.navigation.navigate('Settings', {
											HEADER_HEIGHT: props.HEADER_HEIGHT
										});
                                    }
                                } 
                                key="settings"
							>
                                Settings
                            </MenuItem>
							{
                                (identity && identity[0]?.success) && (
									<>
									<MenuDivider />
									<MenuItem 
										style = {{
											height: 120,
											paddingTop: 5,
											alignSelf: 'center'
										}}
									>
										<View style={{flex:1}}>
											<QRCode
												value="this is identification"
												//logo={{uri: base64Logo}}
												logoSize={30}
												logoBackgroundColor='transparent'
											/>
										</View>
                                    </MenuItem>
									</>
								)
							}
                            
        </Menu>

	);
}

const styles = StyleSheet.create({
    profilePic: {
        borderRadius: 35,
        width:35,
        height: 35,
        alignSelf:'center',
        marginTop: '10%'
    }
});
const isEqual = (prevProps:Props, nextProps:Props) => {
	return (prevProps.HEADER_HEIGHT === nextProps.HEADER_HEIGHT);
}
export default React.memo(Auth, isEqual);