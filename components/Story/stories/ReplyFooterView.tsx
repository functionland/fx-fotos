import React, {useEffect, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BLACK, WHITE} from '../utils/colors';
import SEND from '../images/send.png';
import SMILEY from '../images/smiley.png';
import ARROW from '../images/up-arrow.png';
import {ReplyFooterProps} from '../utils/interfaceHelper';

const ReplyFooterView = ({
  progressIndex,
  onReplyButtonClick,
  onReplyTextChange,
}: ReplyFooterProps) => {
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [showReply, setShowReply] = useState(true);

  useEffect(() => {
    let listener1 = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onShowKeyboard,
    );
    let listener2 = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onHideKeyboard,
    );

    return () => {
      listener1.remove();
      listener2.remove();
    };
  }, []);

  useEffect(() => {
    if (showReply) {
      animate();
    }
  }, [showReply, progressIndex]);

  var animationValue = new Animated.Value(0);
  const animatedStyle = {
    transform: [{translateY: animationValue}],
  };

  const animate = () => {
    Animated.loop(
      Animated.timing(animationValue, {
        toValue: -15, // position where you want the component to end up
        duration: 1500, // time the animation will take to complete, in ms
        easing: Easing.bounce,
        useNativeDriver: false, // <-- Add this
      }),
    ).start();
  };

  function onShowKeyboard(e: any) {
    if (Platform.OS == 'ios') {
      let padding =
        e && (e.endCoordinates.height - e.startCoordinates.height) / 2;
      padding = padding >= 51 ? padding : 51;
      console.log('onShowKeyboard => ', padding);
      setKeyboardPadding(padding);
    }
  }

  function onHideKeyboard(e: any) {
    if (Platform.OS == 'ios') {
      setKeyboardPadding(0);
    }
    animate();
    setShowReply(true);
  }

  return (
    <View style={[styles.parentStyle, {bottom: keyboardPadding}]}>
      {showReply && (
        <TouchableOpacity
          style={styles.replyView}
          onPress={() => setShowReply(false)}>
          <Animated.View
            style={[styles.animatedBox, styles.imgStyle, animatedStyle]}>
            <Animated.Image style={styles.imgStyle} source={ARROW} />
          </Animated.View>
          <Text style={styles.titleStyle}>{'Reply'}</Text>
        </TouchableOpacity>
      )}

      {!showReply && (
        <View style={styles.innerDiv}>
          <TouchableOpacity
            style={styles.imgStyle}
            onPress={() =>
              onReplyButtonClick && onReplyButtonClick('smiley', progressIndex)
            }>
            <Image style={styles.imgStyle} source={SMILEY} />
          </TouchableOpacity>
          <TextInput
            autoFocus
            numberOfLines={5}
            multiline
            underlineColorAndroid="transparent"
            placeholder={'Type a reply...'}
            style={[
              styles.inputStyle,
              Platform.OS === 'android' ? {height: 20} : null,
            ]}
            onChange={(event) =>
              onReplyTextChange &&
              onReplyTextChange(event.nativeEvent.text, progressIndex)
            }
          />
          <TouchableOpacity
            style={styles.imgStyle}
            onPress={() =>
              onReplyButtonClick && onReplyButtonClick('send', progressIndex)
            }>
            <Image style={styles.imgStyle} source={SEND} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReplyFooterView;

const styles = StyleSheet.create({
  parentStyle: {
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    maxHeight: 160,
    paddingRight: '5%',
    paddingLeft: '5%',
  },
  replyView: {
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'center',
    marginBottom: '5%',
  },
  innerDiv: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'android' ? '1%' : '0%',
  },

  imgStyle: {
    width: 24,
    height: 24,
    alignSelf: 'center',
  },

  inputStyle: {
    fontSize: 16,
    color: BLACK,
    marginLeft: '4%',
    marginRight: '4%',
    width: '80%',
    borderRadius: 5,
    paddingTop: 8,
    paddingBottom: 10,
    paddingLeft: 8,
    paddingRight: 8,
    maxHeight: 160,
    minHeight: Platform.OS === 'ios' ? 25 : 40,
    overflow: 'hidden',
    backgroundColor: WHITE,
    borderColor: WHITE,
    flexGrow: 1,
    alignContent: 'center',
    textAlignVertical: 'center',
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
    // marginTop: '1%',
    alignSelf: 'center',
  },
  animatedBox: {
    width: '10%',
    height: '10%',
  },
});
