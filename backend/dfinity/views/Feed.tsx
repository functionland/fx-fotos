import React, { useEffect, useState } from "react";
import { getFeedVideos } from "../utils";
import { Video } from "../components/Video";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ProfileInfoPlus, VideoInfo } from "../utils/canister/typings";

/*
 * Nothing fancy here, either!
 */
export function Feed({
  profileInfo,
  onRefreshUser,
}: {
  profileInfo?: ProfileInfoPlus;
  onRefreshUser: any;
}) {
  const [feed, setFeed] = useState<VideoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profileInfo && profileInfo.userName) {
      setIsLoading(true);
      getFeedVideos(profileInfo.userName)
        .then((videos) => {
          setFeed(videos);
          setIsLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setIsLoading(false);
        });
    }
  }, [profileInfo?.userName]);

  return (
    <main>
      <LoadingIndicator
        loadingMessage="Loading videos..."
        completedMessage="Videos loaded"
        isLoading={isLoading}
      />
      <div className="feed">
        {profileInfo &&
          feed.map((v) => (
            <Video
              key={v.videoId}
              videoInfo={v}
              userId={profileInfo.userName}
              userRewardPoints={Number(profileInfo.rewards.toString())}
              onRefreshUser={onRefreshUser}
            />
          ))}
      </div>
    </main>
  );
}
