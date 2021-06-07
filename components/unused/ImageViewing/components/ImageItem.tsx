import React from 'react';
import {Dimensions, Image} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import {ImageSource} from '../@types';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  imageSrc: ImageSource;
  onRequestClose: () => void;
  onZoom: (isZoomed: boolean) => void;
  onLongPress: (image: ImageSource) => void;
  delayLongPress: number;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
}

const ImageItem: React.FC<Props> = (props) => {
  return (
    <ImageZoom
      cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height}
      imageWidth={200}
      imageHeight={200}>
      <Image style={{resizeMode: 'contain', left: 0}} source={props.imageSrc} />
    </ImageZoom>
  );
};

export default ImageItem;
