import * as React from "react";
import { StyleSheet, View, StatusBar, Platform, Text } from "react-native";
import { ControlBar } from "./ControlBar";
import { EditingWindow } from "./EditingWindow";
import * as ImageManipulator from "expo-image-manipulator";
import { Processing } from "./Processing";
import { useRecoilState, RecoilRoot } from "recoil";
import {
  processingState,
  imageDataState,
  editingModeState,
  ImageDimensions,
} from "./Store";
import { OperationBar } from "./OperationBar/OperationBar";
import { UniversalModal } from "./UniversalModal";
const noScroll = require("no-scroll");

type EditorContextType = {
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

export type Mode = "full" | "crop-only";

export type TransformOperations = "crop" | "rotate";
export type AdjustmentOperations = "blur";
export type EditingOperations = TransformOperations | AdjustmentOperations;

export interface ImageEditorProps {
  visible: boolean;
  onCloseEditor: () => void;
  imageUri: string | undefined;
  fixedCropAspectRatio?: number;
  minimumCropDimensions?: {
    width: number;
    height: number;
  };
  onEditingComplete: (result: any) => void;
  lockAspectRatio?: boolean;
  throttleBlur?: boolean;
  mode?: Mode;
  allowedTransformOperations?: TransformOperations[];
  allowedAdjustmentOperations?: AdjustmentOperations[];
}

function ImageEditorCore(props: ImageEditorProps) {
  //
  const {
    mode = "full",
    throttleBlur = true,
    minimumCropDimensions = { width: 0, height: 0 },
    fixedCropAspectRatio: fixedAspectRatio = 1.6,
    lockAspectRatio = false,
    allowedTransformOperations,
    allowedAdjustmentOperations,
  } = props;

  const [imageData, setImageData] = useRecoilState(imageDataState);
  const [processing, setProcessing] = useRecoilState(processingState);
  const [editingMode, setEditingMode] = useRecoilState(editingModeState);

  // Initialise the image data when it is set through the props
  React.useEffect(() => {
    const initialise = async () => {
      if (props.imageUri) {
        const enableEditor = () => {
          // Set no-scroll to on
          noScroll.on();
        };
        // Platform check
        if (Platform.OS === "web") {
          let img = document.createElement("img");
          img.onload = () => {
            setImageData({
              uri: props.imageUri ?? "",
              height: img.height,
              width: img.width,
            });
            enableEditor();
          };
          img.src = props.imageUri;
        } else {
          const {
            width: pickerWidth,
            height: pickerHeight,
          } = await ImageManipulator.manipulateAsync(props.imageUri, []);
          setImageData({
            uri: props.imageUri,
            width: pickerWidth,
            height: pickerHeight,
          });
          enableEditor();
        }
      }
    };
    initialise();
  }, [props.imageUri]);

  const onCloseEditor = () => {
    // Set no-scroll to off
    noScroll.off();
    props.onCloseEditor();
  };

  React.useEffect(() => {
    // Reset the state of things and only render the UI
    // when this state has been initialised
    if (!props.visible) {
      
    }
    // Check if ther mode is set to crop only if this is the case then set the editingMode
    // to crop
    if (mode === "crop-only") {
      setEditingMode("crop");
    }
  }, [props.visible]);

  return (
    <EditorContext.Provider
      value={{
        mode,
        minimumCropDimensions,
        lockAspectRatio,
        fixedAspectRatio,
        throttleBlur,
        allowedTransformOperations,
        allowedAdjustmentOperations,
        onCloseEditor,
        onEditingComplete: props.onEditingComplete,
      }}
    >

      <UniversalModal
        visible={props.visible}
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        {props.imageUri!=='' ? (
          <View style={styles.container}>
            <ControlBar />
            <EditingWindow />
            {mode === "full" && <OperationBar />}
          </View>
        ) :<View><Text>Loading...</Text></View>}
        {processing ? <Processing /> : null}
      </UniversalModal>
    </EditorContext.Provider>
  );
}

export function ImageEditor(props: ImageEditorProps) {
  return (
    <RecoilRoot>
      <ImageEditorCore {...props} />
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
  },
});
