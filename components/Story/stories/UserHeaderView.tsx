import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {TINT_GRAY, WHITE} from '../utils/colors';
import {UserProps} from '../utils/interfaceHelper';

const UserHeaderView = ({
  userImage,
  userName,
  userMessage,
  imageArrow,
  onImageClick,
}: UserProps) => {
  return (
    <View style={styles.parentStyle}>
      {imageArrow && (
        <TouchableOpacity
          onPress={() => {
            onImageClick && onImageClick();
          }}
          style={styles.imgLeftArrow}>
          <Image style={styles.imgLeftArrow} source={imageArrow} />
        </TouchableOpacity>
      )}
      {userImage && <Image source={userImage} style={styles.circleDiv} />}
      <View style={styles.verticalStyle}>
        <Text style={styles.titleStyle}>{userName}</Text>
        <Text style={styles.descStyle}>{userMessage}</Text>
      </View>
    </View>
  );
};

export default UserHeaderView;

const styles = StyleSheet.create({
  parentStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginTop: '10%',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: TINT_GRAY,
    paddingBottom: '3%',
  },

  titleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
    marginTop: 2,
  },
  descStyle: {
    fontSize: 14,
    fontWeight: '400',
    color: WHITE,
    marginTop: 5,
  },
  circleDiv: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: '2%',
  },
  verticalStyle: {
    flexDirection: 'column',
    marginLeft: '3%',
    justifyContent: 'center',
    width: '70%',
  },
  imgLeftArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: '3%',
  },
});
