import React from 'react';
import { Platform, StatusBar, StyleSheet, View, ImageBackground, } from 'react-native';
import { defaultTheme } from '@rneui/base';
import { useTheme } from '@rneui/themed'
import { Children } from '@rneui/base/dist/Header/components/HeaderChildren';
export const HeaderRNE = ({ statusBarProps, leftComponent, centerComponent, rightComponent, leftContainerStyle, centerContainerStyle, rightContainerStyle, backgroundColor, backgroundImage, backgroundImageStyle, containerStyle, placement = 'center', barStyle, children = [], linearGradientProps, ViewComponent = linearGradientProps || !backgroundImage
    ? View
    : ImageBackground, elevated, ...rest }) => {
    const { theme } = useTheme()
    React.useEffect(() => {
        if (linearGradientProps && !ViewComponent) {
            console.warn("You need to pass a ViewComponent to use linearGradientProps !\nExample: ViewComponent={require('react-native-linear-gradient')}");
        }
    });
    return (<>
        <StatusBar barStyle={barStyle} translucent={true} backgroundColor={backgroundColor || theme?.colors?.primary} {...statusBarProps} />
        <ViewComponent testID="headerContainer" {...rest} style={StyleSheet.flatten([
            {
                //borderBottomColor: '#f2f2f2',
                //borderBottomWidth: StyleSheet.hairlineWidth,
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: theme.mode === 'dark'
                    ? theme.colors.primary
                    : theme.colors.background,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            backgroundColor && { backgroundColor },
            elevated && styles.elevatedHeader,
            containerStyle,
        ])} source={backgroundImage} imageStyle={backgroundImageStyle} {...linearGradientProps}>
            <View style={styles.headerSafeView}>
                <Children style={StyleSheet.flatten([
                    placement === 'center' && styles.rightLeftContainer,
                    leftContainerStyle,
                ])} placement="left">
                    {(React.isValidElement(children) && children) ||
                        children[0] ||
                        leftComponent}
                </Children>
                <Children style={StyleSheet.flatten([
                    styles.centerContainer,
                    placement !== 'center' && {
                        paddingHorizontal: Platform.select({
                            android: 16,
                            default: 15,
                        }),
                    },
                    centerContainerStyle,
                ])} placement={placement}>
                    {children[1] || centerComponent}
                </Children>

                <Children style={StyleSheet.flatten([
                    placement === 'center' && styles.rightLeftContainer,
                    rightContainerStyle,
                ])} placement="right">
                    {children[2] || rightComponent}
                </Children>
            </View>
        </ViewComponent>
    </>);
};
const styles = StyleSheet.create({
    headerSafeView: {
        width: '100%',
        flexDirection: 'row',
    },
    centerContainer: {
        flex: 3,
    },
    rightLeftContainer: {
        flex: 1,
    },
    elevatedHeader: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.6,
        shadowRadius: 8.0,
        elevation: 24,
    },
});
