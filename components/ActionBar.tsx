import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface Props {
    setShowActionBar: Function;
    showActionBar: boolean;
  }
const ActionBar: React.FC<Props> = (props) => {
  const _goBack = () => console.log('Went back');

  const _handleSearch = () => console.log('Searching');

  const _handleMore = () => console.log('Shown more');

  return (
    <View style={[styles.actionBar,{opacity: props.showActionBar?1:0}]}>
        <Appbar.Header>
        <Appbar.BackAction onPress={_goBack} />
        <Appbar.Content title="Title" subtitle="Subtitle" />
        <Appbar.Action icon="magnify" onPress={_handleSearch} />
        <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
        </Appbar.Header>
    </View>
  );
};
const styles = StyleSheet.create({
    actionBar: {
      zIndex:1
    },
  });
export default ActionBar;