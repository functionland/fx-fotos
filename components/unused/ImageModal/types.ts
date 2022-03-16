import { StyleProp } from 'react-native';

export interface OnMove {
  type: string;
  positionX: number;
  positionY: number;
  scale: number;
  zoomCurrentDistance: number;
}

export interface OnTap {
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
}

export interface ImageStyle {
  backfaceVisibility?: 'visible' | 'hidden';
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  overlayColor?: string;
  tintColor?: string;
  opacity?: number;
}