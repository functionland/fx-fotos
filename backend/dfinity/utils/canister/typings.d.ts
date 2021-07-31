import type { Principal } from "@dfinity/agent";
export type Command =
  | {
      assertVideoVirality: { isViral: boolean; videoId: VideoId };
    }
  | {
      putProfileFollow: {
        toFollow: UserId;
        userId: UserId;
        follows: boolean;
      };
    }
  | {
      createTestData: {
        users: Array<UserId>;
        videos: Array<[UserId, VideoId]>;
      };
    }
  | {
      putSuperLike: {
        userId: UserId;
        superLikes: boolean;
        videoId: VideoId;
      };
    }
  | {
      assertVideoFeed: {
        userId: UserId;
        limit: [] | [BigInt];
        videosPred: VideosPred;
      };
    }
  | { reset: TimeMode };
export interface CreateProfile {
  userName: string;
}
export interface CreateVideo {
  info: VideoInit_2;
}
export type Event =
  | {
      uploadReward: { rewards: BigInt; videoId: VideoId_2 };
    }
  | { superlikerReward: { rewards: BigInt; videoId: VideoId_2 } };
export type EventKind =
  | { likeVideo: LikeVideo }
  | { superLikeVideoFail: SuperLikeVideoFail }
  | { superLikeVideo: SuperLikeVideo }
  | { createVideo: CreateVideo }
  | { createProfile: CreateProfile }
  | { emitSignal: Signal }
  | { reset: TimeMode };
export interface Event_2 {
  kind: EventKind;
  time: BigInt;
}
export interface LikeVideo {
  source: UserId_2;
  likes: boolean;
  target: VideoId_2;
}
export interface Message {
  time: Timestamp;
  event: Event;
}
export type ProfileInfo = ProfileInfo_2;
export type ProfileInfoPlus = ProfileInfoPlus_2;
export interface ProfileInfoPlus_2 {
  userName: string;
  uploadedVideos: Array<VideoInfo_2>;
  likedVideos: Array<VideoInfo_2>;
  rewards: BigInt;
  hasPic: boolean;
  followers: Array<ProfileInfo_2>;
  following: Array<ProfileInfo_2>;
}
export interface ProfileInfo_2 {
  userName: string;
  uploadedVideos: Array<VideoId_2>;
  likedVideos: Array<VideoId_2>;
  rewards: BigInt;
  hasPic: boolean;
  followers: Array<UserId_2>;
  following: Array<UserId_2>;
}
export type ProfilePic = ProfilePic_2;
export type ProfilePic_2 = Array<number>;
export type Result = { ok: null } | { err: string };
export type Signal = { viralVideo: ViralVideo };
export interface SuperLikeVideo {
  source: UserId_2;
  target: VideoId_2;
  superLikes: boolean;
}
export interface SuperLikeVideoFail {
  source: UserId_2;
  target: VideoId_2;
}
export type TimeMode = { ic: null } | { script: BigInt };
export type Timestamp = number;
export interface Trace {
  status: { ok: null } | { err: null };
  trace: Array<TraceCommand>;
}
export interface TraceCommand {
  result: Result;
  command: Command;
}
export type UserId = UserId_2;
export type UserId_2 = string;
export type UserId_3 = UserId_2;
export type VideoId = VideoId_2;
export type VideoId_2 = string;
export type VideoId_3 = VideoId_2;
export type VideoInfo = VideoInfo_2;
export interface VideoInfo_2 {
  pic: [] | [VideoPic_2];
  viralAt: [] | [Timestamp];
  userId: UserId_2;
  name: string;
  createdAt: Timestamp;
  tags: Array<string>;
  likes: Array<UserId_2>;
  viewCount: number;
  caption: string;
  chunkCount: number;
  superLikes: Array<UserId_2>;
  uploadedAt: Timestamp;
  videoId: VideoId_2;
}
export type VideoInit = VideoInit_2;
export interface VideoInit_2 {
  userId: UserId_2;
  name: string;
  createdAt: Timestamp;
  tags: Array<string>;
  caption: string;
  chunkCount: number;
}
export type VideoPic = VideoPic_2;
export type VideoPic_2 = Array<number>;
export type VideoResult = [VideoInfo_2, [] | [VideoPic_2]];
export type VideoResults = VideoResults_2;
export type VideoResults_2 = Array<VideoResult>;
export type VideosPred =
  | { containsAll: Array<VideoId> }
  | { equals: Array<VideoId> };
export interface ViralVideo {
  video: VideoId_2;
  superLikers: Array<ViralVideoSuperLiker>;
  uploader: UserId_2;
}
export interface ViralVideoSuperLiker {
  time: BigInt;
  user: UserId_2;
}
export default interface _SERVICE {
  checkUsernameAvailable: (arg_0: string) => Promise<boolean>;
  createProfile: (
    arg_0: string,
    arg_1: [] | [ProfilePic]
  ) => Promise<[] | [ProfileInfoPlus]>;
  createTestData: (
    arg_0: Array<UserId_3>,
    arg_1: Array<[UserId_3, VideoId_3]>
  ) => Promise<[] | [null]>;
  createVideo: (arg_0: VideoInit) => Promise<[] | [VideoId_3]>;
  doDemo: (arg_0: Array<Command>) => Promise<Trace>;
  doDemoCan30: () => Promise<Trace>;
  doDemoCan32: () => Promise<Trace>;
  getEventLog: () => Promise<[] | [Event_2]>;
  getFeedVideos: (
    arg_0: UserId_3,
    arg_1: [] | [BigInt]
  ) => Promise<[] | [VideoResults]>;
  getIsSuperLiker: (
    arg_0: UserId_3,
    arg_1: VideoId_3
  ) => Promise<[] | [boolean]>;
  getMessages: (arg_0: UserId_3) => Promise<[] | [Message]>;
  getProfileInfo: (arg_0: UserId_3) => Promise<[] | [ProfileInfo]>;
  getProfilePic: (arg_0: UserId_3) => Promise<[] | [ProfilePic]>;
  getProfilePlus: (
    arg_0: [] | [UserId_2],
    arg_1: UserId_3
  ) => Promise<[] | [ProfileInfoPlus]>;
  getProfileVideos: (
    arg_0: UserId_3,
    arg_1: [] | [number]
  ) => Promise<[] | [VideoResults]>;
  getProfiles: () => Promise<[] | [ProfileInfo]>;
  getSearchVideos: (
    arg_0: UserId_3,
    arg_1: Array<string>,
    arg_2: [] | [number]
  ) => Promise<[] | [VideoResults]>;
  getSuperLikeValidNow: (
    arg_0: UserId_3,
    arg_1: VideoId_3
  ) => Promise<[] | [boolean]>;
  getUserNameByPrincipal: (arg_0: Principal) => Promise<[] | [string]>;
  getVideoChunk: (
    arg_0: VideoId_3,
    arg_1: number
  ) => Promise<[] | [Array<number>]>;
  getVideoInfo: (
    arg_0: [] | [UserId_2],
    arg_1: VideoId_3
  ) => Promise<[] | [VideoInfo]>;
  getVideoPic: (arg_0: VideoId_3) => Promise<[] | [VideoPic]>;
  getVideos: () => Promise<[] | [VideoInfo]>;
  isDropDay: () => Promise<[] | [boolean]>;
  putProfileFollow: (
    arg_0: UserId_3,
    arg_1: UserId_3,
    arg_2: boolean
  ) => Promise<[] | [null]>;
  putProfilePic: (
    arg_0: UserId_3,
    arg_1: [] | [ProfilePic]
  ) => Promise<[] | [null]>;
  putProfileVideoLike: (
    arg_0: UserId_3,
    arg_1: VideoId_3,
    arg_2: boolean
  ) => Promise<[] | [null]>;
  putSuperLike: (
    arg_0: UserId_3,
    arg_1: VideoId_3,
    arg_2: boolean
  ) => Promise<[] | [null]>;
  putTestFollows: (arg_0: Array<[UserId_3, UserId_3]>) => Promise<[] | [null]>;
  putVideoChunk: (
    arg_0: VideoId_3,
    arg_1: number,
    arg_2: Array<number>
  ) => Promise<[] | [null]>;
  putVideoInfo: (arg_0: VideoId_3, arg_1: VideoInit) => Promise<[] | [null]>;
  putVideoPic: (
    arg_0: VideoId_3,
    arg_1: [] | [VideoPic]
  ) => Promise<[] | [null]>;
  putRewardTransfer: (
    arg_0: UserId_3,
    arg_1: UserId_3,
    amount: BigInt
  ) => Promise<[] | [null]>;
  putAbuseFlagVideo: (
    arg_0: UserId_3,
    arg_1: VideoId,
    shouldFlag: boolean
  ) => Promise<[] | [null]>;
  queryDemoCan30: () => Promise<Trace>;
  queryDemoCan32: () => Promise<Trace>;
  reset: (arg_0: { ic: null } | { script: BigInt }) => Promise<undefined>;
  scriptTimeTick: () => Promise<undefined>;
  setTimeMode: (arg_0: { ic: null } | { script: BigInt }) => Promise<undefined>;
}
