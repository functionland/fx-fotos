import {FunctionComponentElement} from 'react';
import {ImageSourcePropType, ImageStyle, ViewStyle} from 'react-native';
import {Asset} from 'expo-media-library';

export interface CommonProps {
  images?: Array<Asset>;
  duration?: number | undefined;
  containerStyle?: ViewStyle;
  enableProgress?: boolean | undefined;
  imageStyle?: ImageStyle;
  id?: string | undefined;
}

export interface BarStyleProps {
  barActiveColor?: string;
  barInActiveColor?: string;
  barHeight?: number;
  barWidth?: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
}

export interface StoryContainerProps extends CommonProps {
  images: Array<Asset>;
  visible?: boolean | undefined;
  isShowReply?: boolean | undefined;
  duration?: number | undefined;
  barStyle?: BarStyleProps | undefined;

  headerComponent?: FunctionComponentElement<CommonProps> | undefined;
  userProfile?: UserProps | undefined;

  replyView?: ReplyProps | undefined;
  footerComponent?: FunctionComponentElement<CommonProps> | undefined;

  onComplete: () => void;
  id?: string | undefined;
}

export interface ProgressViewProps extends CommonProps {
  images: Array<Asset>;
  onChange: (position: number) => void;
  progressIndex: number;
  barStyle?: BarStyleProps | undefined;
  id?: string | undefined;
}

export interface ProgressItemProps extends CommonProps {
  size: number;
  barStyle?: BarStyleProps | undefined;
  progressIndex: number;
  currentIndex: number;
  // visible?: boolean | undefined,
  onChangePosition: () => void;
}

export interface StoryViewProps extends CommonProps {
  images: Array<Asset>;
  progressIndex: number;
  id?: string | undefined;
}

export interface ArrowViewProps extends CommonProps {
  onArrowClick: () => void;
}

export interface UserProps {
  userImage?: ImageSourcePropType | undefined;
  userName?: string | undefined;
  userMessage?: string | undefined;
  imageArrow?: ImageSourcePropType | undefined;
  onImageClick?: () => void | undefined;
}

export interface ReplyFooterProps {
  progressIndex: number;
  onReplyTextChange: () => void | undefined;
  onReplyButtonClick: () => void | undefined;
}

export interface ReplyProps {
  isShowReply: boolean | undefined;
  onReplyTextChange: () => void | undefined;
  onReplyButtonClick: () => void | undefined;
}

export interface ProgressiveImageProps {
  thumbnailSource: string;
  imgSource: string;
  style?: ImageStyle;
  props?: any;
}
