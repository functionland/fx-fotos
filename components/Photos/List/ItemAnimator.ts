import {BaseItemAnimator} from "recyclerlistview";
import {LayoutAnimation} from "react-native";

export default class ItemAnimator extends BaseItemAnimator {
	constructor() {
		super();
	}
	animateWillMount(atX:any, atY:any, itemIndex:any) {
		//This method is called before the componentWillMount of the list item in the rowrenderer
		//Fill in your logic.
		return undefined;
	}
	animateDidMount(atX:any, atY:any, itemRef:any, itemIndex:any) {
		//This method is called after the componentDidMount of the list item in the rowrenderer
		//Fill in your logic
		//No return
	}
	animateWillUpdate(fromX:any, fromY:any, toX:any, toY:any, itemRef:any, itemIndex:any): void {
		//This method is called before the componentWillUpdate of the list item in the rowrenderer. If the list item is not re-rendered,
		//It is not triggered. Fill in your logic.
		// A simple example can be using a native layout animation shown below - Custom animations can be implemented as required.
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		//No return
	}
	animateShift(fromX:any, fromY:any, toX:any, toY:any, itemRef:any, itemIndex:any): boolean {
		//This method is called if the the props have not changed, but the view has shifted by a certain amount along either x or y axes.
		//Note that, this method is not triggered if the props or size has changed and the animateWillUpdate will be triggered in that case.
		//Return value is used as the return value of shouldComponentUpdate, therefore will trigger a view re-render if true.
		return false;
	}
	animateWillUnmount(atX:any, atY:any, itemRef:any, itemIndex:any): void {
		//This method is called before the componentWillUnmount of the list item in the rowrenderer
		//No return
	}
}