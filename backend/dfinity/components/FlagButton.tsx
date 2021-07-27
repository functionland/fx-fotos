import React, { useState } from "react";

import { putAbuseFlagVideo } from "../utils";
import reportIcon from "../assets/images/icon-report.png";

/*
 * A component to handle flagging videos for abusive content. Takes care of
 * calling the backend canister to flag, and keeps state.
 */
export default function FlagButton({ currentUserId, videoInfo }) {
  // Keep local track of whether video is flagged so we can update the state
  // immediately rather than wait for backend call.
  const [localFlags, setLocalFlags] = useState(
    Number(videoInfo.abuseFlagCount)
  );
  // Keeps track of whether user has already flagged this video.
  const [isActive, setActive] = useState(videoInfo.viewerHasFlagged);
  const handleClick = async () => {
    if (!isActive) {
      setActive(true);
      setLocalFlags(localFlags + 1);
      return putAbuseFlagVideo(currentUserId, videoInfo.videoId, true);
    }
  };

  const isDisabled = localFlags < 1 || isActive;

  return (
    <span
      onClick={handleClick}
      style={{
        pointerEvents: isDisabled ? "none" : "all",
        cursor: isDisabled ? "pointer" : "default",
      }}
    >
      <img
        className={isActive ? "active" : ""}
        src={reportIcon}
        alt="icon: flag current video"
      />
      <span>{Number(localFlags)}/10</span>
    </span>
  );
}
