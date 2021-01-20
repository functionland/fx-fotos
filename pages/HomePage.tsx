import React, {useEffect, useState} from 'react';
import {View, Tabs, Tab, Container, Content} from 'native-base';
import Photos from '../components/Photos';
import {StyleSheet} from 'react-native';

const HomePage = () => {
  return (
    <Container>
      <Photos />
    </Container>
  );
};

const styles = StyleSheet.create({});

export default HomePage;
