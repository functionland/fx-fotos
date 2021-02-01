import React, {useEffect, useState} from 'react';
import {View, Tabs, Tab, Container, Content} from 'native-base';
import Photos from '../components/Photos';
import {StyleSheet} from 'react-native';
import PinchAndZoom from '../components/PinchAndZoom';

const HomePage = () => {
  return (
    // <Container>
      // {/* <PinchAndZoom> */}
      <Photos />
      // {/* </PinchAndZoom> */}
    // </Container>
  );
};

const styles = StyleSheet.create({});

export default HomePage;
