import React, { useEffect, useState } from "react";
import { VideoInfo } from "../utils/canister/typings";
import { getVideoPic } from "../utils";

interface VideoProps {
  video: VideoInfo;
  onClick: (v: VideoInfo) => void;
}

/*
 * This represents a single search result or categorized item in the Discover
 * view. It is a clickable image that launches a video preview overlay.
 */
export function SearchVideoItem(props: VideoProps): JSX.Element {
  const { video, onClick } = props;
  const [pic, setPic] = useState<string>();

  // Since the frontend sends the videoPic to the canister as a byteArray, we
  // have to make sure to translate it back to JPEG before setting it in the DOM
  useEffect(() => {
    getVideoPic(video.videoId).then((picAsNum) => {
      const bufferBlob = [Buffer.from(new Uint8Array(picAsNum))];
      const picBlob = new Blob(bufferBlob, { type: "image/jpeg" });
      const pic = URL.createObjectURL(picBlob);
      setPic(pic);
    });
  }, [video.videoId]);

  return (
    <img
      alt={video.caption}
      className="video-item"
      onClick={() => onClick(video)}
      src={pic}
    />
  );
}
