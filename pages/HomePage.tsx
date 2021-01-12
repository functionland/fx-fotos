import React, {useEffect, useState} from 'react';
import {View, Tabs, Tab, Container, Content} from 'native-base';
import StoragePhotos from '../components/StoragePhotos';
import BoxPhotos from '../components/BoxPhotos';
import {StyleSheet} from 'react-native';

const HomePage = () => {
  return (
    <Container>
      <Tabs>
        <Tab heading="Storage Photos">
          <Content>
            <StoragePhotos />
          </Content>
        </Tab>
        <Tab heading="The Box Photos">
          <Content>
            <BoxPhotos />
          </Content>
        </Tab>
      </Tabs>
    </Container>
  );
};

const styles = StyleSheet.create({});

export default HomePage;
