import type { Principal } from '@dfinity/principal';
export interface AbuseFlag {
  'flag' : boolean,
  'target' : { 'video' : VideoId_2 } |
    { 'user' : UserId },
  'reporter' : UserId,
};
export type ActionTarget = { 'all' : null } |
  { 'video' : VideoId_2 } |
  { 'user' : UserId } |
  { 'pubView' : null };
export type AllowanceBalance = { 'zeroUntil' : Timestamp } |
  { 'zeroForever' : null } |
  { 'nonZero' : bigint };
export interface CanCan {
  'checkUsernameAvailable' : (arg_0: string) => Promise<boolean>,
  'createProfile' : (arg_0: string, arg_1: [] | [ProfilePic]) => Promise<
      [] | [ProfileInfoPlus]
    >,
  'createTestData' : (
      arg_0: Array<UserId_2>,
      arg_1: Array<[UserId_2, VideoId]>,
    ) => Promise<[] | [null]>,
  'createVideo' : (arg_0: VideoInit) => Promise<[] | [VideoId]>,
  'doDemo' : (arg_0: Array<Command>) => Promise<[] | [Trace]>,
  'getAccessLog' : () => Promise<[] | [Array<Event_3>]>,
  'getEventLog' : () => Promise<[] | [Array<Event_2>]>,
  'getFeedVideos' : (arg_0: UserId_2, arg_1: [] | [bigint]) => Promise<
      [] | [VideoResults]
    >,
  'getIsSuperLiker' : (arg_0: UserId_2, arg_1: VideoId) => Promise<
      [] | [boolean]
    >,
  'getMessages' : (arg_0: UserId_2) => Promise<[] | [Array<Message>]>,
  'getProfileInfo' : (arg_0: UserId_2) => Promise<[] | [ProfileInfo]>,
  'getProfilePic' : (arg_0: UserId_2) => Promise<[] | [ProfilePic]>,
  'getProfilePlus' : (arg_0: [] | [UserId_2], arg_1: UserId_2) => Promise<
      [] | [ProfileInfoPlus]
    >,
  'getProfileVideos' : (arg_0: UserId_2, arg_1: [] | [bigint]) => Promise<
      [] | [VideoResults]
    >,
  'getProfiles' : () => Promise<[] | [Array<ProfileInfo>]>,
  'getSearchVideos' : (
      arg_0: UserId_2,
      arg_1: Array<string>,
      arg_2: [] | [bigint],
    ) => Promise<[] | [VideoResults]>,
  'getSuperLikeValidNow' : (arg_0: UserId_2, arg_1: VideoId) => Promise<
      [] | [boolean]
    >,
  'getUserNameByPrincipal' : (arg_0: Principal) => Promise<
      [] | [Array<string>]
    >,
  'getVideoChunk' : (arg_0: VideoId, arg_1: number) => Promise<
      [] | [Array<number>]
    >,
  'getVideoInfo' : (arg_0: [] | [UserId_2], arg_1: VideoId) => Promise<
      [] | [VideoInfo]
    >,
  'getVideoPic' : (arg_0: VideoId) => Promise<[] | [VideoPic]>,
  'getVideos' : () => Promise<[] | [Array<VideoInfo>]>,
  'isDropDay' : () => Promise<[] | [boolean]>,
  'putAbuseFlagUser' : (
      arg_0: UserId_2,
      arg_1: UserId_2,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putAbuseFlagVideo' : (
      arg_0: UserId_2,
      arg_1: VideoId,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putProfileFollow' : (
      arg_0: UserId_2,
      arg_1: UserId_2,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putProfilePic' : (arg_0: UserId_2, arg_1: [] | [ProfilePic]) => Promise<
      [] | [null]
    >,
  'putProfileVideoLike' : (
      arg_0: UserId_2,
      arg_1: VideoId,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putRewardTransfer' : (
      arg_0: UserId_2,
      arg_1: UserId_2,
      arg_2: bigint,
    ) => Promise<[] | [null]>,
  'putRewards' : (arg_0: UserId_2, arg_1: bigint) => Promise<[] | [null]>,
  'putSuperLike' : (arg_0: UserId_2, arg_1: VideoId, arg_2: boolean) => Promise<
      [] | [null]
    >,
  'putTestFollows' : (arg_0: Array<[UserId_2, UserId_2]>) => Promise<
      [] | [null]
    >,
  'putVideoChunk' : (
      arg_0: VideoId,
      arg_1: number,
      arg_2: Array<number>,
    ) => Promise<[] | [null]>,
  'putVideoInfo' : (arg_0: VideoId, arg_1: VideoInit) => Promise<[] | [null]>,
  'putVideoPic' : (arg_0: VideoId, arg_1: [] | [VideoPic]) => Promise<
      [] | [null]
    >,
  'reset' : (arg_0: { 'ic' : null } | { 'script' : bigint }) => Promise<
      [] | [null]
    >,
  'scriptTimeTick' : () => Promise<[] | [null]>,
  'setTimeMode' : (arg_0: { 'ic' : null } | { 'script' : bigint }) => Promise<
      [] | [null]
    >,
};
export interface Check {
  'userAction' : UserAction,
  'caller' : Principal,
  'actionTarget' : ActionTarget,
};
export type Command = {
    'assertVideoVirality' : { 'isViral' : boolean, 'videoId' : VideoId_3 }
  } |
  {
    'putProfileFollow' : {
      'toFollow' : UserId_3,
      'userId' : UserId_3,
      'follows' : boolean,
    }
  } |
  {
    'createTestData' : {
      'users' : Array<UserId_3>,
      'videos' : Array<[UserId_3, VideoId_3]>,
    }
  } |
  {
    'putSuperLike' : {
      'userId' : UserId_3,
      'superLikes' : boolean,
      'videoId' : VideoId_3,
    }
  } |
  {
    'assertVideoFeed' : {
      'userId' : UserId_3,
      'limit' : [] | [bigint],
      'videosPred' : VideosPred,
    }
  } |
  {
    'putRewardTransfer' : {
      'sender' : UserId_3,
      'amount' : bigint,
      'receiver' : UserId_3,
    }
  } |
  { 'reset' : TimeMode };
export interface CreateProfile {
  'pic' : [] | [ProfilePic_2],
  'userName' : string,
};
export interface CreateVideo { 'info' : VideoInit_2 };
export type Event = {
    'uploadReward' : { 'rewards' : bigint, 'videoId' : VideoId_2 }
  } |
  { 'superlikerReward' : { 'rewards' : bigint, 'videoId' : VideoId_2 } } |
  { 'transferReward' : { 'rewards' : bigint } };
export type EventKind = { 'likeVideo' : LikeVideo } |
  { 'superLikeVideoFail' : SuperLikeVideoFail } |
  { 'superLikeVideo' : SuperLikeVideo } |
  { 'rewardPointTransfer' : RewardPointTransfer } |
  { 'createVideo' : CreateVideo } |
  { 'createProfile' : CreateProfile } |
  { 'emitSignal' : Signal } |
  { 'reset' : TimeMode };
export interface Event_2 { 'id' : bigint, 'kind' : EventKind, 'time' : bigint };
export interface Event_3 { 'check' : Check, 'isOk' : boolean, 'time' : bigint };
export interface LikeVideo {
  'source' : UserId,
  'likes' : boolean,
  'target' : VideoId_2,
};
export interface Message { 'id' : bigint, 'time' : Timestamp, 'event' : Event };
export type ProfileInfo = ProfileInfo_2;
export type ProfileInfoPlus = ProfileInfoPlus_2;
export interface ProfileInfoPlus_2 {
  'userName' : string,
  'uploadedVideos' : Array<VideoInfo_2>,
  'likedVideos' : Array<VideoInfo_2>,
  'rewards' : bigint,
  'allowances' : [] | [UserAllowances],
  'hasPic' : boolean,
  'followers' : Array<ProfileInfo_2>,
  'following' : Array<ProfileInfo_2>,
  'viewerHasFlagged' : [] | [boolean],
  'abuseFlagCount' : bigint,
};
export interface ProfileInfo_2 {
  'userName' : string,
  'uploadedVideos' : Array<VideoId_2>,
  'likedVideos' : Array<VideoId_2>,
  'rewards' : bigint,
  'hasPic' : boolean,
  'followers' : Array<UserId>,
  'following' : Array<UserId>,
  'abuseFlagCount' : bigint,
};
export type ProfilePic = ProfilePic_2;
export type ProfilePic_2 = Array<number>;
export type Result = { 'ok' : null } |
  { 'err' : string };
export interface RewardPointTransfer {
  'sender' : UserId,
  'amount' : bigint,
  'receiver' : UserId,
};
export type Signal = { 'viralVideo' : ViralVideo };
export interface SuperLikeVideo {
  'source' : UserId,
  'target' : VideoId_2,
  'superLikes' : boolean,
};
export interface SuperLikeVideoFail { 'source' : UserId, 'target' : VideoId_2 };
export type TimeMode = { 'ic' : null } |
  { 'script' : bigint };
export type Timestamp = bigint;
export interface Trace {
  'status' : { 'ok' : null } |
    { 'err' : null },
  'trace' : Array<TraceCommand>,
};
export interface TraceCommand { 'result' : Result, 'command' : Command };
export type UserAction = { 'admin' : null } |
  { 'view' : null } |
  { 'create' : null } |
  { 'update' : null };
export interface UserAllowances {
  'abuseFlags' : AllowanceBalance,
  'superLikes' : AllowanceBalance,
};
export type UserId = string;
export type UserId_2 = UserId;
export type UserId_3 = UserId;
export type VideoId = VideoId_2;
export type VideoId_2 = string;
export type VideoId_3 = VideoId_2;
export type VideoInfo = VideoInfo_2;
export interface VideoInfo_2 {
  'pic' : [] | [VideoPic_2],
  'viralAt' : [] | [Timestamp],
  'userId' : UserId,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'likes' : Array<UserId>,
  'viewCount' : number,
  'caption' : string,
  'chunkCount' : number,
  'superLikes' : Array<UserId>,
  'viewerHasFlagged' : [] | [boolean],
  'abuseFlagCount' : number,
  'uploadedAt' : Timestamp,
  'videoId' : VideoId_2,
};
export type VideoInit = VideoInit_2;
export interface VideoInit_2 {
  'userId' : UserId,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'caption' : string,
  'chunkCount' : bigint,
};
export type VideoPic = VideoPic_2;
export type VideoPic_2 = Array<number>;
export type VideoResult = [VideoInfo_2, [] | [VideoPic_2]];
export type VideoResults_2 = Array<VideoResult>;
export type VideoResults = VideoResults_2;
export type VideosPred = { 'containsAll' : Array<VideoId_3> } |
  { 'equals' : Array<VideoId_3> };
export interface ViralVideo {
  'video' : VideoId_2,
  'superLikers' : Array<ViralVideoSuperLiker>,
  'uploader' : UserId,
};
export interface ViralVideoSuperLiker { 'time' : bigint, 'user' : UserId };
export default CanCan;