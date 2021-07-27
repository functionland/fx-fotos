import React from "react";
import "./FollowButton.scss";

export function FollowButton({ isFollowing, handleFollow }) {
  return (
    <button
      className={`follow-button${!isFollowing ? " primary" : ""}`}
      onClick={handleFollow}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
