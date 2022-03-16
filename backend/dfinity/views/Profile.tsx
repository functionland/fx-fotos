import React, { useEffect, useState } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import * as H from "history";
import { FollowUserRow } from "../components/FollowUserRow";
import { ProfilePic } from "../components/ProfilePic";
import { Video } from "../components/Video";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { FollowButton } from "../components/FollowButton";
import {
  fileToImgSrc,
  follow,
  getProfilePic,
  getUserFromCanister,
  formatBigNumber,
} from "../utils";
import backIcon from "../assets/images/icon-back.png";
import "./Profile.scss";
import { ProfileInfoPlus, VideoInfo } from "../utils/canister/typings";

type ProfileByIdParams = {
  userId: string;
};

/*
 * Nothing specific to the IC going on here, just fetching data as per usual.
 * This file does a lot of view juggling based on a lot of currentUser data.
 * There are 2 primary views: viewing another user or viewing yourself.
 * There are 4 secondary views: a list of uploaded videos, list of followers,
 * list of users the user follows, and a video preview of any uploaded videos.
 */
export function Profile({
  currentUser,
  onLogOut,
}: {
  currentUser?: ProfileInfoPlus;
  onLogOut?: (history: H.History) => any;
}) {
  const { userId = currentUser?.userName } = useParams<ProfileByIdParams>();
  const [activeSubView, setActiveSubView] = useState(0);
  const history = useHistory();
  const { goBack } = useHistory();

  const [userProfile, setUserProfile] = useState<ProfileInfoPlus>();
  const [profilePic, setProfilePic] = useState("");
  const [videoPreview, setVideoPreview] = useState<VideoInfo>();
  const [isLoading, setLoading] = useState(false);

  const currentUserFollows =
    currentUser?.following.map(({ userName }) => userName) || [];
  const initialIsFollowed = currentUserFollows.indexOf(userId || "") !== -1;
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);

  const isCurrentUserProfile = !userId || userId === currentUser?.userName;

  function handleShowVideoPreview(clickedVideo: VideoInfo) {
    setVideoPreview(clickedVideo);
  }

  async function fetchUserProfile() {
    if (isCurrentUserProfile) {
      setUserProfile(currentUser);
      return;
    }
    try {
      setLoading(true);
      const profileData = await getUserFromCanister(userId || "");
      setUserProfile(profileData!);
    } catch (error) {
      console.error(`Failed to retrieve profile for user ${userId}`, error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfilePic() {
    try {
      const picData = await getProfilePic(userId || "");
      if (picData !== null) {
        const imgSrc = fileToImgSrc([picData]);
        setProfilePic(imgSrc);
      } else {
        console.info(`No profile pic set for user ${userId}`);
      }
    } catch (error) {
      console.error("Failed to retrieve profilePic.", error);
    }
  }

  useEffect(() => {
    Promise.all([fetchUserProfile(), fetchProfilePic()]);
  }, []);

  function handleFollow(userToFollow: string, willFollow: boolean) {
    follow(userToFollow, currentUser?.userName || "", willFollow);
  }

  function handleFollowCurrent() {
    setIsFollowed((state) => !state);
    handleFollow(userName, !isFollowed);
  }

  // @ts-ignore
  const { userName = "", uploadedVideos = [], followers = [], following = [] } =
    userProfile ?? {};

  return (
    <>
      {!isCurrentUserProfile && (
        <header id="alt-header">
          <button id="back" onClick={goBack}>
            <img src={backIcon} alt="Go Back" />
          </button>
          <h2>{userName}</h2>
          <span> </span>
        </header>
      )}
      <main>
        <LoadingIndicator
          loadingMessage="Loading profile..."
          isLoading={isLoading}
        />
        {videoPreview && (
          <Video
            userId={userName}
            userRewardPoints={
              (currentUser && Number(currentUser.rewards.toString())) || 0
            }
            videoInfo={videoPreview}
            isPreview={true}
            onClose={() => setVideoPreview(undefined)}
            key={videoPreview.videoId}
          />
        )}
        <div className="profile-header">
          <ProfilePic name={userId} profilePic={profilePic} />
          <h2>
            {isCurrentUserProfile ? (
              <>
                <span>{userId}</span>
                <br />
                <button
                  className="btn-link"
                  style={{ fontSize: "1.4rem" }}
                  onClick={() => onLogOut && onLogOut(history)}
                >
                  Log out
                </button>
              </>
            ) : (
              <FollowButton
                isFollowing={isFollowed}
                handleFollow={handleFollowCurrent}
              />
            )}
          </h2>
          <section className="profile-nav">
            {[
              ["Videos", uploadedVideos.length],
              ["Followers", followers.length],
              ["Following", following.length],
            ].map(([label, count], index) => (
              <ProfileNavLink
                key={label}
                onClick={() => setActiveSubView(index)}
                isActive={index === activeSubView}
                label={label}
                count={count}
              />
            ))}
          </section>
        </div>
        {activeSubView === 0 && (
          <section className="profile-videos">
            {uploadedVideos.length > 0 ? (
              uploadedVideos.map((uploadedVideo) => (
                <img
                  key={uploadedVideo.videoId}
                  src={fileToImgSrc(uploadedVideo.pic)}
                  alt={`${uploadedVideo.name} - ${uploadedVideo.caption}`}
                  role="button"
                  onClick={() => handleShowVideoPreview(uploadedVideo)}
                />
              ))
            ) : (
              <div className="no-results">
                No videos yet
                {isCurrentUserProfile && (
                  <Link to="/upload">
                    <button className="primary">Upload one now!</button>
                  </Link>
                )}
              </div>
            )}
          </section>
        )}
        {activeSubView === 1 && (
          <section className="followers">
            {followers.length > 0 ? (
              followers.map((follower) => (
                <FollowUserRow
                  key={follower.userName}
                  userName={follower.userName}
                  handleFollow={handleFollow}
                  following={currentUserFollows.includes(follower.userName)}
                  disableFollow={follower.userName === currentUser?.userName}
                />
              ))
            ) : (
              <div className="no-results">No followers yet!</div>
            )}
          </section>
        )}
        {activeSubView === 2 && (
          <section className="following">
            {following.length > 0 ? (
              following.map((following) => (
                <FollowUserRow
                  key={following.userName}
                  userName={following.userName}
                  handleFollow={handleFollow}
                  following={currentUserFollows.includes(following.userName)}
                  disableFollow={following.userName === currentUser?.userName}
                />
              ))
            ) : (
              <div className="no-results">Not following anyone yet!</div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

function ProfileNavLink({ isActive, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`btn-link${isActive ? " active" : ""}`}
    >
      <div className="nav-count">{formatBigNumber(count)}</div>
      <span>{label}</span>
    </button>
  );
}
