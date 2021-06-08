import { ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
const ICON_COLOR = '#FFF';
const CENTER_ICON_SIZE = 36;
const BOTTOM_BAR_ICON_SIZE = 30;
const style = StyleSheet.create({
    iconStyle: {
        textAlign: 'center',
    },
});
export const PlayIcon = () => (<MaterialIcons name='play-arrow' size={CENTER_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
export const PauseIcon = () => (<MaterialIcons name='pause' size={CENTER_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
export const Spinner = () => <ActivityIndicator color={ICON_COLOR} size='large'/>;
export const FullscreenEnterIcon = () => (<MaterialIcons name='fullscreen' size={BOTTOM_BAR_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
export const FullscreenExitIcon = () => (<MaterialIcons name='fullscreen-exit' size={BOTTOM_BAR_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
export const ReplayIcon = () => (<MaterialIcons name='replay' size={CENTER_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
export const MuteIcon = () => (<MaterialIcons name='volume-up' size={BOTTOM_BAR_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
export const UnmuteIcon = () => (<MaterialIcons name='volume-off' size={BOTTOM_BAR_ICON_SIZE} color={ICON_COLOR} style={style.iconStyle}/>);
