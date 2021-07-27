import { login } from '../Auth/auth';
import React, {useEffect, } from 'react';
import { 
    View, 
    StyleSheet, 
    Image, 
    StatusBar,
    Pressable
} from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';

import {
	useRecoilState,
  } from 'recoil';
  import {
	identityState, 
  } from '../../states';

interface Props {
    navigation: any;
}
const Auth: React.FC<Props> = (props) => {
	const [identity, setIdentity] = useRecoilState(identityState);
	const processLogin = async (data:any) => {
		let result = await data;
		setIdentity([result]);
		console.log(result);
	}
	const openWeb = async () => {
		console.log('Internet Identity clicked');
		let result = await login('https://fx.land/Web-Identity-Providers/?pubKey64=', processLogin);
	}
	const disconnectIdentity = () => {
		setIdentity([]);
	}
	const authProviders = [{
		name: ((identity && identity[0]?.success)?'Disconnect from ':'Connect with')+'Internet Identity',
		key: 'Internet Identity',
		action: ((identity && identity[0]?.success)?disconnectIdentity:openWeb),
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

export default React.memo(Auth);