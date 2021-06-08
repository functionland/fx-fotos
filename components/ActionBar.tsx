import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface Props {
    setShowActionBar: Function;
    showActionBar: boolean;
  }
const ActionBar: React.FC<Props> = (props) => {
  const _goBack = () => console.log('Went back');

  const _handleDelete = () => console.log('Deleting');

  const _handleShare = () => console.log('Sharing');

  const _handleAddToAlbum = () => console.log('Adding');

  const _handleMore = () => console.log('Shown more');

  return (
    <View style={[styles.actionBar,{opacity: props.showActionBar?1:0}]}>
        <Appbar.Header style={[styles.actionBar]}>
        <Appbar.BackAction onPress={_goBack} />
        <Appbar.Content title="" subtitle="" />
        <Appbar.Action color="#007AFF" icon="share-variant" onPress={_handleShare} style={[styles.actionBarIcon]} />
        <Appbar.Action color="#007AFF" icon="plus" onPress={_handleAddToAlbum} style={[styles.actionBarIcon]} />
        <Appbar.Action color="#007AFF" icon="trash-can-outline" onPress={_handleDelete} style={[styles.actionBarIcon]} />
        <Appbar.Action color="#007AFF" icon="dots-vertical" onPress={_handleMore} style={[styles.actionBarIcon]} />
        </Appbar.Header>
    </View>
  );
};
const styles = StyleSheet.create({
    actionBar: {
      zIndex:1,
      marginTop:0,
      backgroundColor: 'white',
    },
    actionBarIcon: {
        
    }
  });
export default ActionBar;