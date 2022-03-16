import React, { PropsWithRef, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { ProfileInfoPlus, VideoInfo } from "../utils/canister/typings";
import { SearchVideoItem } from "../components/SearchVideoItem";
import { Video } from "../components/Video";
import { getSearchVideos } from "../utils";
import { LoadingIndicator } from "../components/LoadingIndicator";
import "./Discover.scss";

interface DiscoverProps {
  profileInfo?: ProfileInfoPlus;
}

/*
 * Allows searching for and viewing videos. Nothing especially fancy here, just
 * the typical debounced input fetching data on change.
 */
export function Discover(props: PropsWithRef<DiscoverProps>) {
  const { profileInfo } = props;

  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [videoPreview, setVideoPreview] = useState<VideoInfo>();
  const [isLoading, setLoading] = useState(false);

  function handleChange(val: string) {
    setSearchTerm(val);
  }

  useEffect(() => {
    if (profileInfo) {
      setLoading(true);
      getSearchVideos(profileInfo.userName, searchTerm.split(/\W+/), [10]).then(
        (searchedVideos) => {
          setVideos(searchedVideos);
          setLoading(false);
        }
      );
    }
  }, [searchTerm, profileInfo]);

  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedChangeHandler = debounce(function () {
    handleChange(searchRef?.current?.value || "");
  }, 300);

  function handleClick(clickedVideo: VideoInfo) {
    setVideoPreview(clickedVideo);
  }

  return (
    <main id="discover">
      <LoadingIndicator
        loadingMessage="Loading videos..."
        isLoading={isLoading}
      />
      {videoPreview && profileInfo !== undefined && (
        <Video
          userId={profileInfo.userName}
          userRewardPoints={Number(profileInfo.rewards.toString())}
          videoInfo={videoPreview}
          isPreview={true}
          onClose={() => setVideoPreview(undefined)}
          key={videoPreview.videoId}
        />
      )}

      <div className="search-container">
        <label hidden htmlFor="search">
          Search
        </label>
        <span className="search-icon" />
        <input
          onChange={debouncedChangeHandler}
          ref={searchRef}
          type="text"
          name="search"
          id="search"
          placeholder="Search"
        />
      </div>
      <div className="featured-container">
        {searchTerm ? (
          <section className="video-list search">
            {videos.length > 0 &&
              videos.map((v) => (
                <SearchVideoItem
                  key={v.videoId + "-search"}
                  onClick={handleClick}
                  video={v}
                />
              ))}
          </section>
        ) : (
          <>
            <section className="new-uploads">
              <span className="post-text">New for you</span>
              <div className="video-list">
                {videos.length > 0 &&
                  videos.map((v) => (
                    <SearchVideoItem
                      key={v.videoId + "-newUploads"}
                      onClick={handleClick}
                      video={v}
                    />
                  ))}
              </div>
            </section>
            <section className="viral">
              <span className="post-text">Trending</span>
              <div className="video-list">
                {videos.length > 0 &&
                  videos.map((v) => (
                    <SearchVideoItem
                      key={v.videoId + "-viral"}
                      onClick={handleClick}
                      video={v}
                    />
                  ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
