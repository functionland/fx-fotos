import * as React from "react";
import { Animated, StyleSheet, View, TouchableOpacity } from "react-native";
import _ from "lodash";
import { useRecoilState } from "recoil";
import { cropSizeState, imageBoundsState, accumulatedPanState } from "./Store";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { useContext } from "react";
import { EditorContext } from "expo-image-editor";

const horizontalSections = ["top", "middle", "bottom"];
const verticalSections = ["left", "middle", "right"];

const ImageCropOverlay = () => {
  // Record which section of the fram window has been pressed
  // this determines whether it is a translation or scaling gesture
  const [selectedFrameSection, setSelectedFrameSection] = React.useState("");

  // Shared state and bits passed through recoil to avoid prop drilling
  const [cropSize, setCropSize] = useRecoilState(cropSizeState);
  const [imageBounds] = useRecoilState(imageBoundsState);
  const [accumulatedPan, setAccumluatedPan] = useRecoilState(
    accumulatedPanState
  );
  // Editor context
  const {
    fixedAspectRatio,
    lockAspectRatio,
    minimumCropDimensions,
  } = useContext(EditorContext);

  const [animatedCropSize] = React.useState({
    width: new Animated.Value(cropSize.width),
    height: new Animated.Value(cropSize.height),
  });

  // pan X and Y values to track the current delta of the pan
  // in both directions - this should be zeroed out on release
  // and the delta added onto the accumulatedPan state
  const panX = React.useRef(new Animated.Value(imageBounds.x));
  const panY = React.useRef(new Animated.Value(imageBounds.y));

  React.useEffect(() => {
    // Move the pan to the origin and check the bounds so it clicks to
    // the corner of the image
    checkCropBounds({
      translationX: 0,
      translationY: 0,
    });
    // When the crop size updates make sure the animated value does too!
    animatedCropSize.height.setValue(cropSize.height);
    animatedCropSize.width.setValue(cropSize.width);
  }, [cropSize]);

  React.useEffect(() => {
    // Update the size of the crop window based on the new image bounds
    let newSize = { width: 0, height: 0 };
    const { width, height } = imageBounds;
    const imageAspectRatio = width / height;
    // Then check if the cropping aspect ratio is smaller
    if (fixedAspectRatio < imageAspectRatio) {
      // If so calculate the size so its not greater than the image width
      newSize.height = height;
      newSize.width = height * fixedAspectRatio;
    } else {
      // else, calculate the size so its not greater than the image height
      newSize.width = width;
      newSize.height = width / fixedAspectRatio;
    }
    // Set the size of the crop overlay
    setCropSize(newSize);
  }, [imageBounds]);

  // Function that sets which sections allow for translation when
  // pressed
  const isMovingSection = () => {
    return (
      selectedFrameSection == "topmiddle" ||
      selectedFrameSection == "middleleft" ||
      selectedFrameSection == "middleright" ||
      selectedFrameSection == "middlemiddle" ||
      selectedFrameSection == "bottommiddle"
    );
  };

  // Check what resizing / translation needs to be performed based on which section was pressed
  const isLeft = selectedFrameSection.endsWith("left");
  const isTop = selectedFrameSection.startsWith("top");

  const onOverlayMove = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (selectedFrameSection !== "") {
      // Check if the section pressed is one to translate the crop window or not
      if (isMovingSection()) {
        // If it is then use an animated event to directly pass the tranlation
        // to the pan refs
        Animated.event(
          [
            {
              translationX: panX.current,
              translationY: panY.current,
            },
          ],
          { useNativeDriver: false }
        )(nativeEvent);
      } else {
        // Else its a scaling operation
        const { x, y } = getTargetCropFrameBounds(nativeEvent);
        if (isTop) {
          panY.current.setValue(-y);
        }
        if (isLeft) {
          panX.current.setValue(-x);
        }
        // Finally update the animated width to the values the crop
        // window has been resized to
        animatedCropSize.width.setValue(cropSize.width + x);
        animatedCropSize.height.setValue(cropSize.height + y);
      }
    } else {
      // We need to set which section has been pressed
      const { x, y } = nativeEvent;
      const { width: initialWidth, height: initialHeight } = cropSize;
      let position = "";
      // Figure out where we pressed vertically
      if (y / initialHeight < 0.333) {
        position = position + "top";
      } else if (y / initialHeight < 0.667) {
        position = position + "middle";
      } else {
        position = position + "bottom";
      }
      // Figure out where we pressed horizontally
      if (x / initialWidth < 0.333) {
        position = position + "left";
      } else if (x / initialWidth < 0.667) {
        position = position + "middle";
      } else {
        position = position + "right";
      }
      setSelectedFrameSection(position);
    }
  };

  const getTargetCropFrameBounds = ({
    translationX,
    translationY,
  }: Partial<PanGestureHandlerGestureEvent["nativeEvent"]>) => {
    let x = 0;
    let y = 0;
    if (translationX && translationY) {
      if (translationX < translationY) {
        x = (isLeft ? -1 : 1) * translationX;
        if (lockAspectRatio) {
          y = x / fixedAspectRatio;
        } else {
          y = (isTop ? -1 : 1) * translationY;
        }
      } else {
        y = (isTop ? -1 : 1) * translationY;
        if (lockAspectRatio) {
          x = y * fixedAspectRatio;
        } else {
          x = (isLeft ? -1 : 1) * translationX;
        }
      }
    }
    return { x, y };
  };

  const onOverlayRelease = (
    nativeEvent: PanGestureHandlerGestureEvent["nativeEvent"]
  ) => {
    // Check if the section pressed is one to translate the crop window or not
    if (isMovingSection()) {
      // Ensure the cropping overlay has not been moved outside of the allowed bounds
      checkCropBounds(nativeEvent);
    } else {
      // Else its a scaling op - check that the resizing didnt take it out of bounds
      checkResizeBounds(nativeEvent);
    }
    // Disable the pan responder so the section tiles can register being pressed again
    setSelectedFrameSection("");
  };

  const onHandlerStateChange = ({
    nativeEvent,
  }: PanGestureHandlerGestureEvent) => {
    // Handle any state changes from the pan gesture handler
    // only looking at when the touch ends atm
    if (nativeEvent.state === State.END) {
      onOverlayRelease(nativeEvent);
    }
  };

  const checkCropBounds = ({
    translationX,
    translationY,
  }:
    | PanGestureHandlerGestureEvent["nativeEvent"]
    | { translationX: number; translationY: number }) => {
    // Check if the pan in the x direction exceeds the bounds
    let accDx = accumulatedPan.x + translationX;
    // Is the new x pos less than zero?
    if (accDx <= imageBounds.x) {
      // Then set it to be zero and set the pan to zero too
      accDx = imageBounds.x;
    }
    // Is the new x pos plus crop width going to exceed the right hand bound
    else if (accDx + cropSize.width > imageBounds.width + imageBounds.x) {
      // Then set the x pos so the crop frame touches the right hand edge
      let limitedXPos = imageBounds.x + imageBounds.width - cropSize.width;
      accDx = limitedXPos;
    } else {
      // It's somewhere in between - no formatting required
    }
    // Check if the pan in the y direction exceeds the bounds
    let accDy = accumulatedPan.y + translationY;
    // Is the new y pos less the top edge?
    if (accDy <= imageBounds.y) {
      // Then set it to be zero and set the pan to zero too
      accDy = imageBounds.y;
    }
    // Is the new y pos plus crop height going to exceed the bottom bound
    else if (accDy + cropSize.height > imageBounds.height + imageBounds.y) {
      // Then set the y pos so the crop frame touches the bottom edge
      let limitedYPos = imageBounds.y + imageBounds.height - cropSize.height;
      accDy = limitedYPos;
    } else {
      // It's somewhere in between - no formatting required
    }
    // Record the accumulated pan and reset the pan refs to zero
    panX.current.setValue(0);
    panY.current.setValue(0);
    setAccumluatedPan({ x: accDx, y: accDy });
  };

  const checkResizeBounds = ({
    translationX,
    translationY,
  }:
    | PanGestureHandlerGestureEvent["nativeEvent"]
    | { translationX: number; translationY: number }) => {
    // Check we haven't gone out of bounds when resizing - allow it to be
    // resized up to the appropriate bounds if so
    const { width: maxWidth, height: maxHeight } = imageBounds;
    const { width: minWidth, height: minHeight } = minimumCropDimensions;
    const { x, y } = getTargetCropFrameBounds({ translationX, translationY });
    const animatedWidth = cropSize.width + x;
    const animatedHeight = cropSize.height + y;
    let finalHeight = animatedHeight;
    let finalWidth = animatedWidth;
    // Ensure the width / height does not exceed the boundaries -
    // resize to the max it can be if so
    if (animatedHeight > maxHeight) {
      finalHeight = maxHeight;
      if (lockAspectRatio) finalWidth = finalHeight * fixedAspectRatio;
    } else if (animatedHeight < minHeight) {
      finalHeight = minHeight;
      if (lockAspectRatio) finalWidth = finalHeight * fixedAspectRatio;
    }
    if (animatedWidth > maxWidth) {
      finalWidth = maxWidth;
      if (lockAspectRatio) finalHeight = finalWidth / fixedAspectRatio;
    } else if (animatedWidth < minWidth) {
      finalWidth = minWidth;
      if (lockAspectRatio) finalHeight = finalWidth / fixedAspectRatio;
    }
    // Update the accumulated pan with the delta from the pan refs
    setAccumluatedPan({
      x: accumulatedPan.x + (isLeft ? -x : 0),
      y: accumulatedPan.y + (isTop ? -y : 0),
    });
    // Zero out the pan refs
    panX.current.setValue(0);
    panY.current.setValue(0);
    // Update the crop size to the size after resizing
    setCropSize({
      height: finalHeight,
      width: finalWidth,
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onOverlayMove}
        onHandlerStateChange={(e) => onHandlerStateChange(e)}
      >
        <Animated.View
          style={[
            styles.overlay,
            animatedCropSize,
            {
              transform: [
                { translateX: Animated.add(panX.current, accumulatedPan.x) },
                { translateY: Animated.add(panY.current, accumulatedPan.y) },
              ],
            },
          ]}
        >
          {
            // For reendering out each section of the crop overlay frame
            horizontalSections.map((hsection) => {
              return (
                <View style={styles.sectionRow} key={hsection}>
                  {verticalSections.map((vsection) => {
                    const key = hsection + vsection;
                    return (
                      <View style={[styles.defaultSection]} key={key}>
                        {
                          // Add the corner markers to the topleft,
                          // topright, bottomleft and bottomright corners to indicate resizing
                          key == "topleft" ||
                          key == "topright" ||
                          key == "bottomleft" ||
                          key == "bottomright" ? (
                            <View
                              style={[
                                styles.cornerMarker,
                                hsection == "top"
                                  ? { top: -4, borderTopWidth: 7 }
                                  : { bottom: -4, borderBottomWidth: 7 },
                                vsection == "left"
                                  ? { left: -4, borderLeftWidth: 7 }
                                  : { right: -4, borderRightWidth: 7 },
                              ]}
                            />
                          ) : null
                        }
                      </View>
                    );
                  })}
                </View>
              );
            })
          }
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export { ImageCropOverlay };

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  overlay: {
    height: 40,
    width: 40,
    backgroundColor: "#33333355",
    borderColor: "#ffffff88",
    borderWidth: 1,
  },
  sectionRow: {
    flexDirection: "row",
    flex: 1,
  },
  defaultSection: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#ffffff88",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerMarker: {
    position: "absolute",
    borderColor: "#ffffff",
    height: 30,
    width: 30,
  },
});
