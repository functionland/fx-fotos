import React from "react"
import { BaseScrollView } from "fula-recyclerlistview"
import Animated from "react-native-reanimated"
export default class ExternalScrollView extends BaseScrollView {
  constructor(props) {
    super(props)
  }

  scrollTo(...args: any[]) {
    ;(this.props as any).scrollRefExternal?.current?.scrollTo(...args)
  }

  render() {
    return (
      <Animated.ScrollView
        {...this.props}
        style={{ zIndex: 1 }}
        ref={(this.props as any).scrollRefExternal}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        showsHorizontalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        {this.props.children}
      </Animated.ScrollView>
    )
  }
}
