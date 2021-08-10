import type { Principal } from '@dfinity/agent';
export interface AbuseFlag {
  'flag' : boolean,
  'target' : { 'video' : VideoId_2 } |
    { 'user' : UserId_2 },
  'reporter' : UserId_2,
};
export type ActionTarget = { 'all' : null } |
  { 'video' : VideoId_2 } |
  { 'user' : UserId_2 } |
  { 'pubView' : null };
export type AllowanceBalance = { 'zeroUntil' : Timestamp } |
  { 'zeroForever' : null } |
  { 'nonZero' : bigint };
export type AssocList = AssocList_2;
export type AssocList_10 = List_5;
export type AssocList_11 = AssocList_12;
export type AssocList_12 = List_6;
export type AssocList_13 = AssocList_14;
export type AssocList_14 = List_7;
export type AssocList_15 = AssocList_16;
export type AssocList_16 = List_8;
export type AssocList_17 = AssocList_18;
export type AssocList_18 = List_9;
export type AssocList_2 = List;
export type AssocList_3 = AssocList_4;
export type AssocList_4 = List_2;
export type AssocList_5 = AssocList_6;
export type AssocList_6 = List_3;
export type AssocList_7 = AssocList_8;
export type AssocList_8 = List_4;
export type AssocList_9 = AssocList_10;
export interface Branch { 'left' : Trie, 'size' : bigint, 'right' : Trie };
export interface Branch_2 {
  'left' : Trie_2,
  'size' : bigint,
  'right' : Trie_2,
};
export interface Branch_3 {
  'left' : Trie_3,
  'size' : bigint,
  'right' : Trie_3,
};
export interface Branch_4 {
  'left' : Trie_4,
  'size' : bigint,
  'right' : Trie_4,
};
export interface Branch_5 {
  'left' : Trie_5,
  'size' : bigint,
  'right' : Trie_5,
};
export interface Branch_6 {
  'left' : Trie_6,
  'size' : bigint,
  'right' : Trie_6,
};
export interface Branch_7 {
  'left' : Trie_7,
  'size' : bigint,
  'right' : Trie_7,
};
export interface Branch_8 {
  'left' : Trie_8,
  'size' : bigint,
  'right' : Trie_8,
};
export interface Branch_9 {
  'left' : Trie_9,
  'size' : bigint,
  'right' : Trie_9,
};
export interface CanCan {
  'checkUsernameAvailable' : (arg_0: string) => Promise<boolean>,
  'createProfile' : (arg_0: string, arg_1: [] | [ProfilePic]) => Promise<
      [] | [ProfileInfoPlus]
    >,
  'createTestData' : (
      arg_0: Array<UserId>,
      arg_1: Array<[UserId, VideoId]>,
    ) => Promise<[] | [null]>,
  'createVideo' : (arg_0: VideoInit) => Promise<[] | [VideoId]>,
  'doDemo' : (arg_0: Array<Command>) => Promise<[] | [Trace]>,
  'getAccessLog' : () => Promise<[] | [Array<Event_3>]>,
  'getAllUserVideos' : (arg_0: UserId, arg_1: [] | [bigint]) => Promise<
      [] | [VideoResults]
    >,
  'getEventLog' : () => Promise<[] | [Array<Event_2>]>,
  'getFeedVideos' : (arg_0: UserId, arg_1: [] | [bigint]) => Promise<
      [] | [VideoResults]
    >,
  'getIsSuperLiker' : (arg_0: UserId, arg_1: VideoId) => Promise<
      [] | [boolean]
    >,
  'getMessages' : (arg_0: UserId) => Promise<[] | [Array<Message>]>,
  'getProfileInfo' : (arg_0: UserId) => Promise<[] | [ProfileInfo]>,
  'getProfilePic' : (arg_0: UserId) => Promise<[] | [ProfilePic]>,
  'getProfilePlus' : (arg_0: [] | [UserId], arg_1: UserId) => Promise<
      [] | [ProfileInfoPlus]
    >,
  'getProfileVideos' : (arg_0: UserId, arg_1: [] | [bigint]) => Promise<
      [] | [VideoResults]
    >,
  'getProfiles' : () => Promise<[] | [Array<ProfileInfo>]>,
  'getSearchVideos' : (
      arg_0: UserId,
      arg_1: Array<string>,
      arg_2: [] | [bigint],
    ) => Promise<[] | [VideoResults]>,
  'getSharedVideos' : (arg_0: [] | [string]) => Promise<[] | [VideoResults]>,
  'getState' : () => Promise<StateShared>,
  'getSuperLikeValidNow' : (arg_0: UserId, arg_1: VideoId) => Promise<
      [] | [boolean]
    >,
  'getUserNameByPrincipal' : (arg_0: Principal) => Promise<
      [] | [Array<string>]
    >,
  'getVideo' : (arg_0: [] | [string], arg_1: [] | [string]) => Promise<
      [] | [VideoResult]
    >,
  'getVideoChunk' : (arg_0: VideoId, arg_1: bigint) => Promise<
      [] | [Array<number>]
    >,
  'getVideoInfo' : (arg_0: [] | [UserId], arg_1: VideoId) => Promise<
      [] | [VideoInfo]
    >,
  'getVideoPic' : (arg_0: VideoId) => Promise<[] | [VideoPic]>,
  'getVideos' : () => Promise<[] | [Array<VideoInfo>]>,
  'isDropDay' : () => Promise<[] | [boolean]>,
  'putAbuseFlagUser' : (
      arg_0: UserId,
      arg_1: UserId,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putAbuseFlagVideo' : (
      arg_0: UserId,
      arg_1: VideoId,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putProfileFollow' : (
      arg_0: UserId,
      arg_1: UserId,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putProfilePic' : (arg_0: UserId, arg_1: [] | [ProfilePic]) => Promise<
      [] | [null]
    >,
  'putProfileVideoLike' : (
      arg_0: UserId,
      arg_1: VideoId,
      arg_2: boolean,
    ) => Promise<[] | [null]>,
  'putRewardTransfer' : (
      arg_0: UserId,
      arg_1: UserId,
      arg_2: bigint,
    ) => Promise<[] | [null]>,
  'putRewards' : (arg_0: UserId, arg_1: bigint) => Promise<[] | [null]>,
  'putSuperLike' : (arg_0: UserId, arg_1: VideoId, arg_2: boolean) => Promise<
      [] | [null]
    >,
  'putTestFollows' : (arg_0: Array<[UserId, UserId]>) => Promise<[] | [null]>,
  'putVideoChunk' : (
      arg_0: VideoId,
      arg_1: bigint,
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
  'shareVideo' : (arg_0: UserId, arg_1: string, arg_2: boolean) => Promise<
      [] | [string]
    >,
  'testGetUserNameByPrincipal' : (arg_0: [] | [Principal]) => Promise<
      undefined
    >,
};
export interface Check {
  'userAction' : UserAction,
  'caller' : Principal,
  'actionTarget' : ActionTarget,
};
export type ChunkData = ChunkData_2;
export type ChunkData_2 = Array<number>;
export type ChunkId = string;
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
  { 'abuseFlag' : AbuseFlag } |
  { 'superLikeVideoFail' : SuperLikeVideoFail } |
  { 'superLikeVideo' : SuperLikeVideo } |
  { 'rewardPointTransfer' : RewardPointTransfer } |
  { 'createVideo' : CreateVideo } |
  { 'shareVideo' : ShareVideo } |
  { 'createProfile' : CreateProfile } |
  { 'emitSignal' : Signal } |
  { 'reset' : TimeMode };
export interface Event_2 { 'id' : bigint, 'kind' : EventKind, 'time' : bigint };
export interface Event_3 { 'check' : Check, 'isOk' : boolean, 'time' : bigint };
export type Hash = number;
export interface Key { 'key' : ChunkId, 'hash' : Hash };
export interface Key_2 { 'key' : UserId_2, 'hash' : Hash };
export interface Key_3 { 'key' : VideoId_2, 'hash' : Hash };
export interface Key_4 { 'key' : Principal, 'hash' : Hash };
export interface Leaf { 'size' : bigint, 'keyvals' : AssocList };
export interface Leaf_2 { 'size' : bigint, 'keyvals' : AssocList_3 };
export interface Leaf_3 { 'size' : bigint, 'keyvals' : AssocList_5 };
export interface Leaf_4 { 'size' : bigint, 'keyvals' : AssocList_7 };
export interface Leaf_5 { 'size' : bigint, 'keyvals' : AssocList_9 };
export interface Leaf_6 { 'size' : bigint, 'keyvals' : AssocList_11 };
export interface Leaf_7 { 'size' : bigint, 'keyvals' : AssocList_13 };
export interface Leaf_8 { 'size' : bigint, 'keyvals' : AssocList_15 };
export interface Leaf_9 { 'size' : bigint, 'keyvals' : AssocList_17 };
export interface LikeVideo {
  'source' : UserId_2,
  'likes' : boolean,
  'target' : VideoId_2,
};
export type List = [] | [[[Key, ChunkData], List]];
export type List_2 = [] | [[[Key_2, Trie_3], List_2]];
export type List_3 = [] | [[[Key_2, null], List_3]];
export type List_4 = [] | [[[Key_2, Trie_5], List_4]];
export type List_5 = [] | [[[Key_3, null], List_5]];
export type List_6 = [] | [[[Key_2, Profile], List_6]];
export type List_7 = [] | [[[Key_2, bigint], List_7]];
export type List_8 = [] | [[[Key_4, UserId_2], List_8]];
export type List_9 = [] | [[[Key_3, Video], List_9]];
export type MapShared = Trie;
export type MapShared_2 = Trie_6;
export type MapShared_3 = Trie_7;
export type MapShared_4 = Trie_8;
export type MapShared_5 = Trie_9;
export interface Message { 'id' : bigint, 'time' : Timestamp, 'event' : Event };
export interface Profile { 'userName' : string, 'createdAt' : Timestamp };
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
  'followers' : Array<UserId_2>,
  'following' : Array<UserId_2>,
  'abuseFlagCount' : bigint,
};
export type ProfilePic = ProfilePic_2;
export type ProfilePic_2 = Array<number>;
export type RelShared = RelShared_2;
export interface RelShared_2 { 'forw' : Trie2D };
export type RelShared_3 = RelShared_4;
export interface RelShared_4 { 'forw' : Trie2D_2 };
export type Result = { 'ok' : null } |
  { 'err' : string };
export interface RewardPointTransfer {
  'sender' : UserId_2,
  'amount' : bigint,
  'receiver' : UserId_2,
};
export interface ShareVideo {
  'isShared' : boolean,
  'target' : VideoId_2,
  'receiver' : UserId_2,
};
export type Signal = { 'viralVideo' : ViralVideo };
export interface StateShared {
  'follows' : RelShared,
  'likes' : RelShared_3,
  'users' : MapShared_4,
  'rewards' : MapShared_3,
  'uploaded' : RelShared_3,
  'chunks' : MapShared,
  'videos' : MapShared_5,
  'profiles' : MapShared_2,
};
export interface SuperLikeVideo {
  'source' : UserId_2,
  'target' : VideoId_2,
  'superLikes' : boolean,
};
export interface SuperLikeVideoFail {
  'source' : UserId_2,
  'target' : VideoId_2,
};
export type TimeMode = { 'ic' : null } |
  { 'script' : bigint };
export type Timestamp = bigint;
export interface Trace {
  'status' : { 'ok' : null } |
    { 'err' : null },
  'trace' : Array<TraceCommand>,
};
export interface TraceCommand { 'result' : Result, 'command' : Command };
export type Trie = { 'branch' : Branch } |
  { 'leaf' : Leaf } |
  { 'empty' : null };
export type Trie2D = Trie_2;
export type Trie2D_2 = Trie_4;
export type Trie_2 = { 'branch' : Branch_2 } |
  { 'leaf' : Leaf_2 } |
  { 'empty' : null };
export type Trie_3 = { 'branch' : Branch_3 } |
  { 'leaf' : Leaf_3 } |
  { 'empty' : null };
export type Trie_4 = { 'branch' : Branch_4 } |
  { 'leaf' : Leaf_4 } |
  { 'empty' : null };
export type Trie_5 = { 'branch' : Branch_5 } |
  { 'leaf' : Leaf_5 } |
  { 'empty' : null };
export type Trie_6 = { 'branch' : Branch_6 } |
  { 'leaf' : Leaf_6 } |
  { 'empty' : null };
export type Trie_7 = { 'branch' : Branch_7 } |
  { 'leaf' : Leaf_7 } |
  { 'empty' : null };
export type Trie_8 = { 'branch' : Branch_8 } |
  { 'leaf' : Leaf_8 } |
  { 'empty' : null };
export type Trie_9 = { 'branch' : Branch_9 } |
  { 'leaf' : Leaf_9 } |
  { 'empty' : null };
export type UserAction = { 'admin' : null } |
  { 'view' : null } |
  { 'create' : null } |
  { 'update' : null };
export interface UserAllowances {
  'abuseFlags' : AllowanceBalance,
  'superLikes' : AllowanceBalance,
};
export type UserId = UserId_2;
export type UserId_2 = string;
export type UserId_3 = UserId_2;
export interface Video {
  'viralAt' : [] | [Timestamp],
  'externalId' : string,
  'userId' : UserId_2,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'viewCount' : bigint,
  'caption' : string,
  'chunkCount' : bigint,
  'uploadedAt' : Timestamp,
};
export type VideoId = VideoId_2;
export type VideoId_2 = string;
export type VideoId_3 = VideoId_2;
export type VideoInfo = VideoInfo_2;
export interface VideoInfo_2 {
  'pic' : [] | [VideoPic_2],
  'viralAt' : [] | [Timestamp],
  'externalId' : string,
  'userId' : UserId_2,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'likes' : Array<UserId_2>,
  'viewCount' : bigint,
  'caption' : string,
  'sharedCount' : bigint,
  'chunkCount' : bigint,
  'superLikes' : Array<UserId_2>,
  'viewerHasFlagged' : [] | [boolean],
  'abuseFlagCount' : bigint,
  'uploadedAt' : Timestamp,
  'videoId' : VideoId_2,
};
export type VideoInit = VideoInit_2;
export interface VideoInit_2 {
  'externalId' : string,
  'userId' : UserId_2,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'caption' : string,
  'chunkCount' : bigint,
};
export type VideoPic = VideoPic_2;
export type VideoPic_2 = Array<number>;
export type VideoResult = VideoResult_2;
export interface VideoResult_2 [VideoInfo_2, [] | [VideoPic_2]];
export type VideoResults = VideoResults_2;
export type VideoResults_2 = Array<VideoResult_2>;
export type VideosPred = { 'containsAll' : Array<VideoId_3> } |
  { 'equals' : Array<VideoId_3> };
export interface ViralVideo {
  'video' : VideoId_2,
  'superLikers' : Array<ViralVideoSuperLiker>,
  'uploader' : UserId_2,
};
export interface ViralVideoSuperLiker { 'time' : bigint, 'user' : UserId_2 };
export default CanCan;