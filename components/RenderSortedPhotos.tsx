import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {Image, Item, Text, View} from 'native-base';
import React from 'react';
import FastImage from 'react-native-fast-image';
import {FlatList} from 'react-native-gesture-handler';

interface Props {
  photos: Array<PhotoIdentifier>;
  title: string;
}

const RenderSortedPhotos: React.FC<Props> = (props) => {
  return (
    <View key={props.title}>
      <Text>{props.title}</Text>
      {props.photos ? (
        <FlatList
          key={props.photos[0].node.image.uri}
          data={props.photos}
          numColumns={3}
          renderItem={({item}) => (
            <FastImage
              key={item.node.image.uri}
              style={{
                width: '30.5%',
                height: 150,
                margin: 5,
              }}
              source={{uri: item.node.image.uri}}
            />
          )}></FlatList>
      ) : (
        <Text>''</Text>
      )}
    </View>
  );
};

export default RenderSortedPhotos;
