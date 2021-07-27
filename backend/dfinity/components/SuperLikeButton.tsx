import React from "react";
import iconSuperLike from "../assets/images/icon-superlike.png";

export default function SuperLikeButton({
  handleSuperLike,
  isSuperLiked,
  disabled,
}) {
  return (
    <span
      style={{
        pointerEvents: disabled ? "none" : "all",
        cursor: disabled ? "pointer" : "default",
      }}
      onClick={handleSuperLike}
      data-test-id="superlike"
    >
      <img
        src={iconSuperLike}
        className={isSuperLiked ? "active" : "default"}
        alt="SuperLike"
      />
    </span>
  );
}
