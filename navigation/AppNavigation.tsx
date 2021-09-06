import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PermissionError from '../pages/PermissionError';
import React, { useState, } from 'react';
import HomePage from '../pages/HomePage';
import Settings from '../pages/Settings';
import ImportGoogle from '../pages/ImportGoogle';
import Browser from './Browser';
import BarcodeScanner from '../pages/BarcodeScanner';
import { StyleSheet, Animated, View, TouchableOpacity, Text, StatusBar } from 'react-native';
import Header from '../components/Header';
import { createBottomTabNavigator,BottomTabBarProps,BottomTabBarOptions,  } from '@react-navigation/bottom-tabs';
//import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import {default as Reanimated, useSharedValue, useDerivedValue, runOnJS } from 'react-native-reanimated';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  const scrollY2 = useSharedValue(0);
  const scrollY3 = useSharedValue(0);
  const scrollY4 = useSharedValue(0);

  const scale = useSharedValue(1);
  const numColumnsAnimated = useSharedValue(2);
  const [showHeader, setShowHeader] = useState<boolean|undefined>(true);

  const headerShown = useSharedValue(1);
  
  useDerivedValue(()=>{
    console.log('headerShown changed to '+headerShown.value);
    if(headerShown.value===0){
      runOnJS(setShowHeader)(false);
    }else{
      runOnJS(setShowHeader)(true);
    }
  }, [headerShown])


  const HEADER_HEIGHT = 30;
  const FOOTER_HEIGHT = 60;
  
  return (
    <Reanimated.View style={[styles.View, 
    ]}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation, route }) => ({
						headerMode: 'screen',
            headerCenter: () => (
              <Header 
                scrollY2={scrollY2} 
                scrollY3={scrollY3} 
                scrollY4={scrollY4} 
                HEADER_HEIGHT={HEADER_HEIGHT} 
                headerShown={headerShown} 
                navigation={navigation}
              />),
            ////headerTitle: '',
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerHideShadow:true,
            headerShown:showHeader,
            headerTranslucent:true,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Stack.Screen
            name="HomePage"
            options={{
              
            }}
          >
            {props => <HomeNavigation {...props} 
              scrollY2={scrollY2} 
              scrollY3={scrollY3} 
              scrollY4={scrollY4} 
              scale={scale} 
              numColumnsAnimated={numColumnsAnimated} 
              HEADER_HEIGHT={HEADER_HEIGHT} 
              FOOTER_HEIGHT={FOOTER_HEIGHT}
              headerShown={headerShown} 
              showHeader={showHeader}
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
            component={ImportGoogle}
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
            options={{headerShown: true, headerTranslucent: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Reanimated.View>
  );
};

interface Props {
  scrollY2: Reanimated.SharedValue<number>;
  scrollY3: Reanimated.SharedValue<number>;
  scrollY4: Reanimated.SharedValue<number>;
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>;
  HEADER_HEIGHT: number;
  FOOTER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
  showHeader: boolean|undefined;
}
const HomeNavigation: React.FC<Props> = (mainProps) => {
  const TabBar = ({state, descriptors, navigation}: BottomTabBarProps<BottomTabBarOptions>) => {
    return (
      <View style={[
        { 
          opacity: mainProps.showHeader?1:0,
          height: mainProps.showHeader?mainProps.FOOTER_HEIGHT:0,
          flexDirection: 'row',
          backgroundColor:"white",
          borderRadius:0,
          justifyContent:"center",
          alignItems:"center",
          shadowRadius: 2,
          shadowColor:'#000000',
          elevation: 4,
          shadowOffset: {
            width: 0,
            height: -3,
          },
        }
      ]}>
        {state.routes.map((route:any, index:any) => {
          const { options } = descriptors[route.key];
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
              style={{ flex: 1, alignItems:"center" }}
              key={"TabTouchable_"+label+"_"+new Date()}
            >
              <View>{icon?icon({focused:isFocused,color:isFocused ? '#0a72ac' : '#3e2465',size:18}):<></>}</View>
              <Text style={{ color: isFocused ? '#0a72ac' : '#3e2465' }}>
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
            marginTop:0, 
          }
        ]
      }>
        <Tab.Navigator 
          tabBar={props => <TabBar {...props} key='mainTabBar' />}
        >
          <Tab.Screen
            name="Photos"
            key="TabScreen_Photos"
            options={{
              tabBarLabel: 'Photos',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="photo-video" color={color} size={size} />
              ),
            }}
          >
            {props => <HomePage {...props} 
              scrollY2={mainProps.scrollY2} 
              scrollY3={mainProps.scrollY3} 
              scrollY4={mainProps.scrollY4} 
              scale={mainProps.scale} 
              numColumnsAnimated={mainProps.numColumnsAnimated} 
              HEADER_HEIGHT={mainProps.HEADER_HEIGHT + (StatusBar.currentHeight||0)} 
              FOOTER_HEIGHT={mainProps.FOOTER_HEIGHT}
              headerShown={mainProps.headerShown} 
            />}
          </Tab.Screen>
          <Tab.Screen
            name="Search"
            key="TabScreen_Search"
            component={Search}
            options={{
              tabBarLabel: 'Search',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="search" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Library"
            key="TabScreen_Library"
            component={Library}
            options={{
              tabBarLabel: 'Library',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="list-alt" size={size} color={color} />
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
