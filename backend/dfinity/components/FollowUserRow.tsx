import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ProfilePic } from "./ProfilePic";
import { FollowButton } from "./FollowButton";
import "./FollowUserRow.scss";

/*
 * A single instance of a row in the Followers/Following Profile views. Displays
 * the user's profile picture and username as a link to their profile, along
 * with a button to follow/unfollow that user.
 */
export function FollowUserRow({
  userName,
  handleFollow = () => {},
  following = false,
  disableFollow = false,
}: {
  userName: string;
  handleFollow?: (userName: string, willFollow: boolean) => void;
  following?: boolean;
  disableFollow?: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(following);

  // Instead of waiting for the return from the canister update call, we
  // optimistically update the UI
  function handleFollowClick(event) {
    event.preventDefault();
    setIsFollowing((state) => !state);
    handleFollow(userName, !isFollowing);
  }

  return (
    <Link to={disableFollow ? "/profile" : `/profiles/${userName}`}>
      <div className="follow-row">
        <ProfilePic profilePic="" name={userName} />
        <span className="username">{userName}</span>
        {disableFollow ? (
          <div />
        ) : (
          <FollowButton
            isFollowing={isFollowing}
            handleFollow={handleFollowClick}
          />
        )}
      </div>
    </Link>
  );
}
