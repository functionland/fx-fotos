import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PermissionError from '../pages/PermissionError';
import React from 'react';
import HomePage from '../pages/HomePage';
import Settings from '../pages/Settings';
import ImportGoogle from '../pages/ImportGoogle';
import NewAlbum from '../pages/NewAlbum';
import Browser from './Browser';
import BarcodeScanner from '../pages/BarcodeScanner';
import {View, TouchableOpacity, Text} from 'react-native';
import {createBottomTabNavigator, BottomTabBarProps, BottomTabBarOptions} from '@react-navigation/bottom-tabs';
import {FontAwesome5} from '@expo/vector-icons';
import {FOOTER_HEIGHT} from "../components/Photos/Constants";
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={({navigation, route}) => ({
						headerShown: false
					})}
				>
					<Stack.Screen
						name="HomePage"
						options={{}}
						component={HomeNavigation}
					/>
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
		</SafeAreaProvider>
	);
};

interface Props {
}

const HomeNavigation: React.FC<Props> = (mainProps) => {
	const TabBar = ({state, descriptors, navigation}: BottomTabBarProps<BottomTabBarOptions>) => {
		return (
			<View style={[
				{
					height: FOOTER_HEIGHT,
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
				component={HomePage}
			/>
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

	);
};

function Search() {
	return (<></>);
}

function Library() {
	return (<></>);
}

export default AppNavigation;
