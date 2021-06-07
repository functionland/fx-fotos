/// <reference types="react" />
import {AVPlaybackStatus, VideoProps} from 'expo-av';

declare enum ErrorSeverity {
  Fatal = 'Fatal',
  NonFatal = 'NonFatal',
}
declare type Error = {
  type: ErrorSeverity;
  message: string;
  obj: Record<string, unknown>;
};
declare const _default: (
  props: {
    videoProps: VideoProps & {ref: any};
  } & {
    height?: number | undefined;
    children?: null | undefined;
    playIcon?: (() => JSX.Element) | undefined;
    pauseIcon?: (() => JSX.Element) | undefined;
    spinner?: (() => JSX.Element) | undefined;
    fullscreenEnterIcon?: (() => JSX.Element) | undefined;
    fullscreenExitIcon?: (() => JSX.Element) | undefined;
    replayIcon?: (() => JSX.Element) | undefined;
    switchToLandscape?: (() => void) | undefined;
    switchToPortrait?: (() => void) | undefined;
    mute?: (() => void) | undefined;
    unmute?: (() => void) | undefined;
    inFullscreen?: boolean | undefined;
    isMute?: boolean | undefined;
    sliderColor?: string | undefined;
    disableSlider?: boolean | undefined;
    thumbImage?: null | undefined;
    iosTrackImage?: null | undefined;
    showFullscreenButton?: boolean | undefined;
    showMuteButton?: boolean | undefined;
    textStyle?:
      | {
          color: string;
          fontSize: number;
        }
      | undefined;
    videoBackground?: string | undefined;
    width?: number | undefined;
    videoRef?: null | undefined;
    errorCallback?: ((error: Error) => void) | undefined;
    debug?: boolean | undefined;
    playbackCallback?: ((callback: AVPlaybackStatus) => void) | undefined;
    fadeInDuration?: number | undefined;
    quickFadeOutDuration?: number | undefined;
    fadeOutDuration?: number | undefined;
    hideControlsTimerDuration?: number | undefined;
    showControlsOnLoad?: boolean | undefined;
  },
  ref?: unknown,
) => JSX.Element;
export default _default;
