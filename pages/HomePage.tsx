import React, {useEffect, useState} from 'react';
import {View, Tabs, Tab, Container, Content} from 'native-base'
import StoragePhotos from '../components/StoragePhotos'
import BoxPhotos from '../components/BoxPhotos'

const HomePage = () => {

  return (
    <Container>
      <Content>
      <Tabs>
        <Tab heading="Storage Photos">
          <StoragePhotos />
        </Tab>
        <Tab heading="The Box Photos">
          <BoxPhotos />
        </Tab>
      </Tabs>
      </Content>
    </Container>
  );
};

export default HomePage;
