import React, {useEffect, useRef, useState} from 'react';
import ProgressItem from './ProgressItem';
import {TINT_GRAY} from '../utils/colors';
import {ProgressViewProps} from '../utils/interfaceHelper';
import {FlatList, StyleSheet, View} from 'react-native';

function ProgressView(props: ProgressViewProps) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(listener);
    };
  }, []);
  const [progressIndex, setProgressIndex] = useState(0);
  const [listener, setListener] = useState<any>();

  useEffect(() => {
    if (isMounted) {
      setProgressIndex(props.progressIndex);
      // alert(props.progressIndex)
    }
  }, [props.progressIndex]);

  useEffect(() => {
    if (isMounted) {
      setProgressIndex(progressIndex);
    }
  }, [props.enableProgress]);

  function changePosition() {
    if (isMounted) {
      if (props.enableProgress) {
        if (progressIndex < props.images.length) {
          const mProgress = progressIndex + 1;
          // console.log("changePosition " + mProgress)
          props.onChange(mProgress);
          clearTimeout(listener);
          setListener(
            setTimeout(() => {
              setProgressIndex(mProgress);
            }, 0),
          );
        }
      } else {
        // TODO (compare with web version)
        setProgressIndex(progressIndex);
      }
    }
  }

  return (
    <View style={styles.parent}>
      {/* {
        props.images.map((value, index) => (
          <ProgressItem
            size={props.images.length}
            duration={props.duration}
            barStyle={props.barStyle}
            progressIndex={progressIndex}
            currentIndex={index}
            onChangePosition={() => changePosition()} />
        ))
      } */}

      <FlatList
        contentContainerStyle={styles.flatStyle}
        pagingEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        legacyImplementation={false}
        data={props.images}
        ItemSeparatorComponent={() => <View style={{marginLeft: 4}} />}
        key={props.id + '_FlatList'}
        keyExtractor={(item, index) =>
          props.id + '_FlatList_ProgressItem_' + index + '_' + item.uri
        }
        renderItem={({item, index}) => (
          <ProgressItem
            enableProgress={props.enableProgress}
            size={props.images.length}
            duration={props.duration}
            barStyle={props.barStyle}
            progressIndex={progressIndex}
            currentIndex={index}
            onChangePosition={() => changePosition()}
            key={props.id + '_FlatList_ProgressItem_' + index + '_' + item.uri}
          />
        )}
      />
    </View>
  );
}

export default ProgressView;

const styles = StyleSheet.create({
  parent: {
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    position: 'absolute',
    flexDirection: 'row',
    flex: 1,
    backgroundColor: TINT_GRAY,
  },
  flatStyle: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: '3%',
    paddingRight: '3%',
    paddingTop: '5%',
    paddingBottom: '4%',
  },
});
