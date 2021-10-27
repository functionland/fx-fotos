import {ImageDimensions} from "./Store";
import * as React from "react";
export type TransformOperations = "crop" | "rotate";
export type AdjustmentOperations = "blur";
export type EditingOperations = TransformOperations | AdjustmentOperations;
export type Mode = "full" | "crop-only";

export type EditorContextType = {
	throttleBlur: boolean;
	minimumCropDimensions: ImageDimensions;
	fixedAspectRatio: number;
	lockAspectRatio: boolean;
	mode: Mode;
	onCloseEditor: () => void;
	onEditingComplete: (result: any) => void;
	allowedTransformOperations?: TransformOperations[];
	allowedAdjustmentOperations?: AdjustmentOperations[];
};

export const EditorContext = React.createContext<EditorContextType>({
	throttleBlur: true,
	minimumCropDimensions: {
		width: 0,
		height: 0,
	},
	fixedAspectRatio: 1.6,
	lockAspectRatio: false,
	mode: "full",
	onCloseEditor: () => {},
	onEditingComplete: () => {},
});