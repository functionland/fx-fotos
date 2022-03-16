import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { ActivityIndicator, StyleSheet } from 'react-native'

class Browser extends Component {
  LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' style={styles.ActivityIndicatorStyle} />
  }

  render() {
      console.log(this.props);
    const { params } = (this.props as any).route;

    return (
      params.link && <WebView
        source={{ uri: params.link }}
        renderLoading={this.LoadingIndicatorView}
        startInLoadingState={true}
        onMessage={(e: {nativeEvent: {data?: string}}) => {
           console.log('Message received from JS: ', e.nativeEvent.data);
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  ActivityIndicatorStyle: {
    flex: 1,
    justifyContent: 'center'
  }
})

export default Browser