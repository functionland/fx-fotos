import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Animated, Dimensions} from 'react-native';
import {reduxState, sortCondition} from '../types/interfaces';
import RenderPhotos from './RenderPhotos';
import * as MediaLibrary from 'expo-media-library';
import {opacityTransition, sectionizeMedia} from '../utils/functions';
import {useDispatch, useSelector} from 'react-redux';
import {getPhotos} from '../store/actions';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

interface Props {
  photos: Array<MediaLibrary.Asset>;
  scale: Animated.Value;
  pinchOrZoom: 'pinch' | 'zoom' | undefined;
  sortCondition: sortCondition;
  numColumns: 2 | 3 | 4;
}

const AllPhotos: React.FC<Props> = (props) => {
  const photos = useSelector((state: reduxState) => state.photos);
  const loading = useSelector((state: reduxState) => state.loading);

  const [wrapperHeight, setWrapperHeight] = useState<number>();

  const dispatch = useDispatch();
  const getMorePhotos = () => {
    console.log('getting more photos');
    dispatch(getPhotos(20, ''));
  };

  useEffect(() => {
    getMorePhotos();
  }, []);

  console.log('wrapperHeight', wrapperHeight);
  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{
        width: SCREEN_WIDTH,
        height: wrapperHeight ? wrapperHeight + 200 : SCREEN_HEIGHT,
        // flexWrap: "wrap",
        // alignSelf: "baseline"
        // height: "auto",
        // flexGrow: 1,
      }}>
      <RenderPhotos
        setWrapperHeight={setWrapperHeight}
        wrapperHeight={wrapperHeight}
        photos={sectionizeMedia(photos, 'day')}
        loading={loading}
        getMorePhotosFunction={getMorePhotos}
        margin={props.scale.interpolate({
          inputRange: [0, SCREEN_WIDTH * 0.8],
          outputRange: [1, 5],
        })}
        maxWidth={SCREEN_WIDTH / 2}
        minWidth={SCREEN_WIDTH / 3}
        numColumns={2}
        opacity={props.scale.interpolate({
          inputRange: [0, SCREEN_WIDTH * 0.8],
          outputRange: opacityTransition(
            props.sortCondition,
            props.numColumns,
            props.pinchOrZoom,
          ).day.col[2],
        })}
        // opacity={opacityTransition(sortCondition, numColumns, 'day', 2)}
        date={new Date()}
        separator="day"
        zIndex={(props.numColumns === 2)?1:0}
      />
      <RenderPhotos
        setWrapperHeight={setWrapperHeight}
        wrapperHeight={wrapperHeight}
        photos={sectionizeMedia(photos, 'day')}
        loading={loading}
        getMorePhotosFunction={getMorePhotos}
        margin={props.scale.interpolate({
          inputRange: [0, SCREEN_WIDTH * 0.8],
          outputRange: [1, 5],
        })}
        maxWidth={SCREEN_WIDTH / 2}
        minWidth={SCREEN_WIDTH / 4}
        numColumns={3}
        opacity={props.scale.interpolate({
          inputRange: [0, SCREEN_WIDTH * 0.8],
          outputRange: opacityTransition(
            props.sortCondition,
            props.numColumns,
            props.pinchOrZoom,
          ).day.col[3],
        })}
        // opacity={opacityTransition(sortCondition, numColumns, 'day', 3)}
        date={new Date()}
        separator="day"
        zIndex={(props.numColumns === 3)?1:0}
      />
      <RenderPhotos
        photos={sectionizeMedia(photos, 'month')}
        wrapperHeight={wrapperHeight}
        setWrapperHeight={setWrapperHeight}
        loading={loading}
        getMorePhotosFunction={getMorePhotos}
        margin={props.scale.interpolate({
          inputRange: [0, SCREEN_WIDTH * 0.8],
          outputRange: [1, 5],
        })}
        maxWidth={SCREEN_WIDTH / 3}
        minWidth={SCREEN_WIDTH / 5}
        numColumns={4}
        opacity={props.scale.interpolate({
          inputRange: [0, SCREEN_WIDTH * 0.8],
          outputRange: opacityTransition(
            props.sortCondition,
            props.numColumns,
            props.pinchOrZoom,
          ).month.col[4],
        })}
        // opacity={opacityTransition(sortCondition, numColumns, 'month', 4)}
        date={new Date()}
        separator="month"
        zIndex={(props.numColumns === 4)?1:0}
      />
    </ScrollView>
  );
};

export default AllPhotos;
