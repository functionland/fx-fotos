import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import PhotosContainer from '../components/PhotosContainer';

const HomePage = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <PhotosContainer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default HomePage;
