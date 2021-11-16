import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PermissionError from '../pages/PermissionError';
import React, {useState,} from 'react';
import HomePage from '../pages/HomePage';
import Settings from '../pages/Settings';
import ImportGoogle from '../pages/ImportGoogle';
import NewAlbum from '../pages/NewAlbum';
import Browser from './Browser';
import BarcodeScanner from '../pages/BarcodeScanner';
import {StyleSheet, Animated, View, TouchableOpacity, Text, StatusBar} from 'react-native';
import Header from '../components/Header';
import {createBottomTabNavigator, BottomTabBarProps, BottomTabBarOptions,} from '@react-navigation/bottom-tabs';
import {FontAwesome5} from '@expo/vector-icons';
import {default as Reanimated, useSharedValue, useDerivedValue, runOnJS} from 'react-native-reanimated';
import ScrollContext from "../components/Shared/ScrollContext";
import {useRecoilValue} from "recoil";
import {HeaderVisibilityState} from "../states/layout";
import {FOOTER_HEIGHT, HEADER_HEIGHT} from "../components/Photos/Constants";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
	const [showHeader, setShowHeader] = useState<boolean | undefined>(true);

	const headerShown = useSharedValue(1);

	useDerivedValue(() => {
		console.log('headerShown changed to ' + headerShown.value);
		if (headerShown.value === 0) {
			runOnJS(setShowHeader)(false);
		} else {
			runOnJS(setShowHeader)(true);
		}
	}, [headerShown])




	return (
		<Reanimated.View style={[styles.View,
		]}>
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={({navigation, route}) => ({
						headerMode: 'screen',
						headerCenter: () => (
							<Header
								HEADER_HEIGHT={HEADER_HEIGHT}
							/>),
						////headerTitle: '',
						headerStyle: {
							backgroundColor: 'transparent',
						},
						headerHideShadow: true,
						headerShown: showHeader,
						headerTranslucent: true,
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					})}
				>
					<Stack.Screen
						name="HomePage"
						options={{}}
					>
						{props => <HomeNavigation {...props}
												  HEADER_HEIGHT={HEADER_HEIGHT}
												  FOOTER_HEIGHT={FOOTER_HEIGHT}
						/>}
					</Stack.Screen>
					<Stack.Screen
						name="PermissionError"
						component={PermissionError}
						options={{headerShown: false}}
					/>
					<Stack.Screen
						name="Settings"
						component={Settings}
						options={{headerShown: true}}
					/>
					<Stack.Screen
						name="ImportGoogle"
						component={ImportGoogle}
						options={{headerShown: true}}
					/>
					<Stack.Screen
						name="NewAlbum"
						component={NewAlbum}
						options={{headerShown: true}}
					/>
					<Stack.Screen
						name="Browser"
						component={Browser}
						options={{headerShown: false}}
					/>
					<Stack.Screen
						name="BarcodeScanner"
						component={BarcodeScanner}
						options={{headerShown: true, headerTranslucent: false}}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</Reanimated.View>
	);
};

interface Props {
	HEADER_HEIGHT: number;
	FOOTER_HEIGHT: number;
}

const HomeNavigation: React.FC<Props> = (mainProps) => {
	const headerVisibility = useRecoilValue(HeaderVisibilityState)
	const TabBar = ({state, descriptors, navigation}: BottomTabBarProps<BottomTabBarOptions>) => {
		return (
			<View style={[
				{
					opacity: headerVisibility ? 1 : 0,
					height: headerVisibility ? mainProps.FOOTER_HEIGHT : 0,
					flexDirection: 'row',
					backgroundColor: "white",
					borderRadius: 0,
					justifyContent: "center",
					alignItems: "center",
					shadowRadius: 2,
					shadowColor: '#000000',
					elevation: 4,
					shadowOffset: {
						width: 0,
						height: -3,
					},
				}
			]}>
				{state.routes.map((route: any, index: any) => {
					const {options} = descriptors[route.key];
					const label =
						options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
								? options.title
								: route.name;

					const icon =
						options.tabBarIcon !== undefined
							? options.tabBarIcon
							: null

					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: 'tabLongPress',
							target: route.key,
						});
					};

					return (
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel={options.tabBarAccessibilityLabel}
							testID={options.tabBarTestID}
							onPress={onPress}
							onLongPress={onLongPress}
							style={{flex: 1, alignItems: "center"}}
							key={"TabTouchable_" + label + "_" + new Date()}
						>
							<View>{icon ? icon({
								focused: isFocused,
								color: isFocused ? '#0a72ac' : '#3e2465',
								size: 18
							}) : <></>}</View>
							<Text style={{color: isFocused ? '#0a72ac' : '#3e2465'}}>
								{label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	}
	return (
		<Animated.View
			style={
				[
					styles.View,
					{
						marginTop: 0,
					}
				]
			}>
			<Tab.Navigator
				tabBar={props => <TabBar {...props} key='mainTabBar'/>}
			>
				<Tab.Screen
					name="Photos"
					key="TabScreen_Photos"
					options={{
						tabBarLabel: 'Photos',
						tabBarIcon: ({color, size}) => (
							<FontAwesome5 name="photo-video" color={color} size={size}/>
						),
					}}
				>
					{props => <HomePage {...props}
										HEADER_HEIGHT={mainProps.HEADER_HEIGHT + (StatusBar.currentHeight || 0)}
										FOOTER_HEIGHT={mainProps.FOOTER_HEIGHT}
					/>}
				</Tab.Screen>
				<Tab.Screen
					name="Search"
					key="TabScreen_Search"
					component={Search}
					options={{
						tabBarLabel: 'Search',
						tabBarIcon: ({color, size}) => (
							<FontAwesome5 name="search" size={size} color={color}/>
						),
					}}
				/>
				<Tab.Screen
					name="Library"
					key="TabScreen_Library"
					component={Library}
					options={{
						tabBarLabel: 'Library',
						tabBarIcon: ({color, size}) => (
							<FontAwesome5 name="list-alt" size={size} color={color}/>
						),
					}}
				/>
			</Tab.Navigator>
		</Animated.View>
	);
};

function Search() {
	return (<></>);
}

function Library() {
	return (<></>);
}

const styles = StyleSheet.create({
	View: {
		flex: 1,
		//marginTop: StatusBar.currentHeight || 0,
		backgroundColor: 'white',
		position: 'relative',
	},
});
export default AppNavigation;
