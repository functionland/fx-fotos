import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import FlagButton from "./FlagButton";
import SuperLikeButton from "./SuperLikeButton";
import TippingButton from "./TippingButton";
import { ProfilePic } from "./ProfilePic";
import { SuperLikeEffect } from "./SuperLikeEffect";
import { getVideoChunks, getProfilePic, like, superLike } from "../utils";
import likeIcon from "../assets/images/icon-like.png";
import commentIcon from "../assets/images/icon-comment.png";
import shareIcon from "../assets/images/icon-share.png";
import "./Video.scss";

// The amount of flags a video needs before we blur it out on frontend
const VIDEO_BLUR_MIN = 1;

interface VideoProps {
  videoInfo: any;
  userId: string;
  userRewardPoints: number;
  onRefreshUser?: any;
  isPreview?: boolean;
  onClose?: () => void;
}

// Wrapper to allow us to use the same video component for single previews from
// Profile and Discover, and for all videos in the Feed
export function Video(props: VideoProps) {
  const {
    isPreview = false,
    userId,
    userRewardPoints,
    onRefreshUser,
    videoInfo,
    onClose = () => {},
  } = props;
  return isPreview ? (
    <div className="preview-container">
      <VideoBase
        isPreview
        userId={userId}
        userRewardPoints={userRewardPoints}
        videoInfo={videoInfo}
        onClose={onClose}
      />
    </div>
  ) : (
    <VideoBase
      userId={userId}
      userRewardPoints={userRewardPoints}
      onRefreshUser={onRefreshUser}
      videoInfo={videoInfo}
      onClose={onClose}
    />
  );
}

function VideoBase(props: VideoProps) {
  const {
    videoInfo,
    userId,
    userRewardPoints = 0,
    isPreview = false,
    onRefreshUser = () => {},
    onClose = () => {},
  } = props;
  const [play, setPlay] = useState(false);
  const [videoSourceURL, setVideoSourceURL] = useState<string>();
  const [userPic, setUserPic] = useState<string>();
  const [userLikes, setUserLikes] = useState(videoInfo.likes.includes(userId));
  const [isSuperLiked, setIsSuperLiked] = useState(
    videoInfo.superLikes.includes(userId)
  );

  const videoIsFlagged = videoInfo.abuseFlagCount >= VIDEO_BLUR_MIN;

  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = function () {
    setPlay(!play);
  };

  // Load video and uploader profilePic on first mount.
  useEffect(() => {
    if (!videoInfo) {
      return;
    }
    getVideoChunks(videoInfo).then((blobURL) => {
      setVideoSourceURL(blobURL);
      setPlay(true);
    });
    getProfilePic(videoInfo.userId).then((bytes) => {
      if (!bytes) {
        return;
      }
      const picBlob = new Blob([Buffer.from(new Uint8Array(bytes))], {
        type: "image/jpeg",
      });
      const pic = URL.createObjectURL(picBlob);
      setUserPic(pic);
    });

    return () => videoRef.current?.pause();
  }, [videoInfo?.videoId]);

  // Only play video if it has not been flagged/reported
  useEffect(() => {
    if (!videoIsFlagged) {
      play ? videoRef.current?.play() : videoRef.current?.pause();
    }
  }, [play]);

  function handleLike() {
    like(userId, videoInfo.videoId, !userLikes);
    setUserLikes((state) => !state);
  }

  function handleSuperLike() {
    if (!isSuperLiked) {
      setIsSuperLiked(true);
      superLike(userId, videoInfo.videoId, true);
    }
  }

  const isCurrentUser = userId === videoInfo.userId;
  const videoBlurStyle = videoIsFlagged ? { filter: "blur(20px)" } : {};

  return (
    <div className="video-container">
      <SuperLikeEffect isActive={isSuperLiked} />
      {isPreview && (
        <button
          onClick={onClose}
          className="close-preview"
          aria-label="close preview"
        />
      )}
      <video
        onClick={handlePlayClick}
        ref={videoRef}
        src={videoSourceURL}
        loop={true}
        muted={true}
        autoPlay={false}
        style={videoBlurStyle}
      />
      <div className="user-details">
        <ProfilePic name={videoInfo.userId} profilePic={userPic} />
        <div style={{ position: "relative" }}>
          <div className="uploader-info">
            <span className="userId">
              <Link
                to={
                  isCurrentUser ? `/profile` : `/profiles/${videoInfo.userId}`
                }
              >
                @{videoInfo.userId}
              </Link>
            </span>
            <p className="caption">{videoInfo.caption}</p>
          </div>
        </div>
      </div>

      {/* Side controls for user interaction with the video. */}
      <div className="feed-controls">
        <div className="feed-control" id="superlikeButton">
          <SuperLikeButton
            disabled={videoInfo.userId === userId}
            handleSuperLike={handleSuperLike}
            isSuperLiked={isSuperLiked}
          />
          <span>
            {/*currentUser?.remainingSuperlikes ||*/ 0}/
            {/*currentUser?.totalSuperlikes ||*/ 10}
          </span>
        </div>
        <div className="feed-control">
          <TippingButton
            senderId={userId}
            currentRewardPoints={userRewardPoints}
            recipientId={videoInfo.userId}
            onRefreshUser={onRefreshUser}
          />
        </div>
        <div className="feed-control">
          <img
            onClick={handleLike}
            className={userLikes ? "active" : ""}
            style={{ display: "inline" }}
            src={likeIcon}
            alt="like toggle button"
          />
          <span>
            {videoInfo.likes.length +
              // if they are toggling on and off, only subtract if they are
              // already a liker it and only add if they are not already a liker
              (userLikes
                ? videoInfo.likes.includes(userId)
                  ? 0
                  : 1
                : videoInfo.likes.includes(userId)
                ? -1
                : 0)}
          </span>
        </div>
        <div className="feed-control disabled">
          <img
            src={commentIcon}
            className={
              videoInfo.comments?.some((comment) => comment.userId === userId)
                ? "active"
                : ""
            }
            alt="icon: comment on current video"
          />
          <span>{videoInfo.comments?.length ?? 0}</span>
        </div>
        <div className="feed-control disabled">
          <img
            src={shareIcon}
            className={videoInfo.shares?.includes(userId) ? "active" : ""}
            alt="icon: share current video"
          />
          <span>{videoInfo.shares?.length ?? 0}</span>
        </div>
        <div className="feed-control">
          <FlagButton currentUserId={userId} videoInfo={videoInfo} />
        </div>
      </div>
    </div>
  );
}
