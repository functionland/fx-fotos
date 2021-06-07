import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {ProgressiveImageProps} from '../utils/interfaceHelper';

const ProgressiveImageView = ({
  thumbnailSource,
  imgSource,
  style,
  props,
}: ProgressiveImageProps) => {
  const thumbnailAnimated = new Animated.Value(0);
  const imageAnimated = new Animated.Value(0);

  console.log(thumbnailSource);

  const handleThumbnailLoad = () => {
    console.log('handleThumbnailLoad Loaded');
    Animated.timing(thumbnailAnimated, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const onImageLoad = () => {
    console.log('OnImage Loaded');
    Animated.timing(imageAnimated, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{uri: thumbnailSource}}
        style={[style, {opacity: thumbnailAnimated}]}
        onLoad={() => handleThumbnailLoad()}
        // blurRadius={1}
      />
      <Animated.Image
        source={{uri: imgSource}}
        style={[styles.imageOverlay, {opacity: imageAnimated}, style]}
        onLoad={() => onImageLoad()}
      />
    </View>
  );
};

// export default ProgressiveImageView;

const styles = StyleSheet.create({
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    backgroundColor: '#e1e4e8',
  },
});
