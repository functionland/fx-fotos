import {BaseScrollView} from "recyclerlistview";
import {default as Reanimated} from "react-native-reanimated";
import React from "react";

export class ExternalScrollView extends BaseScrollView {
	scrollTo(...args: any[]) {
		(this.props as any).scrollRefExternal?.current?.scrollTo(...args);
	}

	render() {
		return (
			<Reanimated.ScrollView {...this.props}
								   style={{zIndex: 1}}
								   ref={(this.props as any).scrollRefExternal}
								   scrollEventThrottle={16}
								   nestedScrollEnabled={true}
								   removeClippedSubviews={true}
								   showsVerticalScrollIndicator={false}
			>
				{this.props.children}
			</Reanimated.ScrollView>
		);
	}
}