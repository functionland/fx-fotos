import * as React from 'react';
import PropTypes from 'prop-types';
import { Animated, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 

const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

export default class RoundCheckbox extends React.PureComponent {
  static propTypes = {
    onValueChange: PropTypes.func,
    icon: PropTypes.string,
    size: PropTypes.number,
    backgroundColor: PropTypes.string,
    iconColor: PropTypes.string,
    borderColor: PropTypes.string,
    checked: PropTypes.bool,
    style: PropTypes.object,
  };

  static defaultProps = {
    icon: 'check',
    size: 24,
    backgroundColor: '#007AFF',
    iconColor: 'white',
    borderColor: 'grey',
    checked: false,
    onValueChange: () => {},
  };

  constructor(props) {
    super(props);
    this.scaleAndOpacityOfCheckbox = new Animated.Value(props.checked ? 1 : 0);
  }

  componentDidUpdate(prevProps) {
    if (this.props.checked !== prevProps.checked) {
      Animated.timing(this.scaleAndOpacityOfCheckbox, {
        toValue: this.props.checked ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }

  render() {
    const { size, backgroundColor, borderColor, icon, iconColor, style } = this.props;
    const iconSize = parseInt(size * 1.3, 10);

    const bothStyles = {
      width: size,
      height: size,

      borderRadius: size / 2,
    };

    const checkedStyles = {
      backgroundColor,
      borderColor: backgroundColor,
      opacity: this.scaleAndOpacityOfCheckbox,
      transform: [{ scale: this.scaleAndOpacityOfCheckbox }],
      position: 'absolute',
      top: 0,
      left: 0,
    };

    return (
      <TouchableWithoutFeedback hitSlop={hitSlop} onPress={this._onPress} style={style}>
        <View style={styles.parentWrapper} shouldRasterizeIOS={true}>
          <Animated.View
            style={[
              {
                borderColor,
                backgroundColor: 'transparent',
                opacity: this.scaleAndOpacityOfCheckbox.interpolate({
                  inputRange: [0, 0.9],
                  outputRange: [1, 0],
                }),
              },
              bothStyles,
              styles.commonWrapperStyles,
            ]}
          />
          <Animated.View style={[checkedStyles, bothStyles, styles.commonWrapperStyles]}>
            <MaterialIcons
              name={icon}
              color={iconColor}
              size={Math.ceil(iconSize/1.5)}
              style={{
                height: iconSize,
                backgroundColor: 'transparent',
                alignSelf: 'center',
                textAlignVertical:'center'
              }}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _onPress = () => {
    this.props.onValueChange(!this.props.checked);
  };
}

const styles = StyleSheet.create({
  parentWrapper: {
    position: 'relative',
  },
  commonWrapperStyles: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});