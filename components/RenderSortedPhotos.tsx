import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {Text} from 'native-base';
import React from 'react';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';

interface Props {
  photoObject: {[key: string]: Array<PhotoIdentifier>};
}

const renderComponent = (props: Props) => {
  let result: Array<Element> = [];
  
  console.log("sege")

  for (let photoTitle of Object.keys(props.photoObject)) {
    // result.push();
    result.push(
      <SafeAreaView>
        <FlatList
          key={photoTitle}
          data={props.photoObject[photoTitle]}
          numColumns={3}
          ListHeaderComponent={<Text>{photoTitle}</Text>}
          renderItem={({item}) => (
            <FastImage
              key={item.node.image.uri}
              source={{uri: item.node.image.uri}}
              style={{
                width: '30%',
                height: 150,
                margin: 5,
              }}
            />
          )}
        />
      </SafeAreaView>,
    );
  }
  console.log('hello', result);

  return result;
};

const RenderSortedPhotos: React.FC<Props> = (props) => {
  return <>{renderComponent(props)}</>;
};

export default RenderSortedPhotos;
