import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import PhotosContainer from '../components/PhotosContainer';

const HomePage = () => {
  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <PhotosContainer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
  },
});

export default HomePage;
