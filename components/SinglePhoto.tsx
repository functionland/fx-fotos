import React, { useState, useEffect } from 'react';
import {Dimensions} from 'react-native';
import ImageView from 'react-native-image-viewing';
import { Asset } from 'expo-media-library';
import { FlatSection } from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  modalShown: boolean;
  setModalShown: Function;
  photos: FlatSection;
  singlePhotoIndex: number;
}

const SinglePhoto: React.FC<Props> = (props) => {
  const [medias, setMedias] = useState<Asset[]>([]);
  useEffect(()=>{
    let medias:any[] = props.photos.layout.filter(item => typeof item.value !== 'string').map((item)=>{return item.value});
    setMedias(medias);
  }, [props.photos])
  
  return (
    <ImageView
      images={medias}
      imageIndex={props.singlePhotoIndex}
      visible={props.modalShown}
      onRequestClose={() => props.setModalShown(false)}
      animationType='slide'
      swipeToCloseEnabled={true}
      doubleTapToZoomEnabled={true}
    />
  );
};

export default SinglePhoto;
