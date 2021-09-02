import type { Principal } from '@dfinity/principal';
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
export type AlbumInfo = AlbumInfo_2;
export interface AlbumInfo_2 { 'name' : string };
export type AllowanceBalance = { 'zeroUntil' : Timestamp } |
  { 'zeroForever' : null } |
  { 'nonZero' : number };
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
export type AssocList_19 = AssocList_20;
export type AssocList_2 = List;
export type AssocList_20 = List_10;
export type AssocList_21 = AssocList_22;
export type AssocList_22 = List_11;
export type AssocList_3 = AssocList_4;
export type AssocList_4 = List_2;
export type AssocList_5 = AssocList_6;
export type AssocList_6 = List_3;
export type AssocList_7 = AssocList_8;
export type AssocList_8 = List_4;
export type AssocList_9 = AssocList_10;
export interface Branch { 'left' : Trie, 'size' : number, 'right' : Trie };
export interface Branch_10 {
  'left' : Trie_10,
  'size' : number,
  'right' : Trie_10,
};
export interface Branch_11 {
  'left' : Trie_11,
  'size' : number,
  'right' : Trie_11,
};
export interface Branch_2 {
  'left' : Trie_2,
  'size' : number,
  'right' : Trie_2,
};
export interface Branch_3 {
  'left' : Trie_3,
  'size' : number,
  'right' : Trie_3,
};
export interface Branch_4 {
  'left' : Trie_4,
  'size' : number,
  'right' : Trie_4,
};
export interface Branch_5 {
  'left' : Trie_5,
  'size' : number,
  'right' : Trie_5,
};
export interface Branch_6 {
  'left' : Trie_6,
  'size' : number,
  'right' : Trie_6,
};
export interface Branch_7 {
  'left' : Trie_7,
  'size' : number,
  'right' : Trie_7,
};
export interface Branch_8 {
  'left' : Trie_8,
  'size' : number,
  'right' : Trie_8,
};
export interface Branch_9 {
  'left' : Trie_9,
  'size' : number,
  'right' : Trie_9,
};
export interface CanCan {
  'addVideo2Album' : (
      arg_0: [] | [Array<string>],
      arg_1: VideoId,
      arg_2: UserId,
    ) => Promise<undefined>,
  'checkUsernameAvailable' : (arg_0: string) => Promise<boolean>,
  'createAlbum' : (arg_0: [] | [Array<string>], arg_1: UserId) => Promise<
      [] | [Array<string>]
    >,
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
  'getAllUserVideos' : (arg_0: UserId, arg_1: [] | [number]) => Promise<
      [] | [VideoResults]
    >,
  'getEventLog' : () => Promise<[] | [Array<Event_2>]>,
  'getFeedVideos' : (arg_0: UserId, arg_1: [] | [number]) => Promise<
      [] | [VideoResults]
    >,
  'getIsSuperLiker' : (arg_0: UserId, arg_1: VideoId) => Promise<
      [] | [boolean]
    >,
  'getMessages' : (arg_0: UserId) => Promise<[] | [Array<Message>]>,
  'getProfileAlbums' : (arg_0: UserId, arg_1: [] | [number]) => Promise<
      [] | [Array<AlbumInfo>]
    >,
  'getProfileInfo' : (arg_0: UserId) => Promise<[] | [ProfileInfo]>,
  'getProfilePic' : (arg_0: UserId) => Promise<[] | [ProfilePic]>,
  'getProfilePlus' : (arg_0: [] | [UserId], arg_1: UserId) => Promise<
      [] | [ProfileInfoPlus]
    >,
  'getProfileVideos' : (arg_0: UserId, arg_1: [] | [number]) => Promise<
      [] | [VideoResults]
    >,
  'getProfiles' : () => Promise<[] | [Array<ProfileInfo>]>,
  'getSearchVideos' : (
      arg_0: UserId,
      arg_1: Array<string>,
      arg_2: [] | [number],
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
  'getVideoChunk' : (
      arg_0: VideoId,
      arg_1: number,
      arg_2: [] | [string],
    ) => Promise<[] | [Array<number>]>,
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
      arg_2: number,
    ) => Promise<[] | [null]>,
  'putRewards' : (arg_0: UserId, arg_1: number) => Promise<[] | [null]>,
  'putSuperLike' : (arg_0: UserId, arg_1: VideoId, arg_2: boolean) => Promise<
      [] | [null]
    >,
  'putTestFollows' : (arg_0: Array<[UserId, UserId]>) => Promise<[] | [null]>,
  'putVideoChunk' : (
      arg_0: VideoId,
      arg_1: number,
      arg_2: Array<number>,
    ) => Promise<[] | [null]>,
  'putVideoInfo' : (arg_0: VideoId, arg_1: VideoInit) => Promise<[] | [null]>,
  'putVideoPic' : (arg_0: VideoId, arg_1: [] | [VideoPic]) => Promise<
      [] | [null]
    >,
  'reset' : (arg_0: { 'ic' : null } | { 'script' : number }) => Promise<
      [] | [null]
    >,
  'scriptTimeTick' : () => Promise<[] | [null]>,
  'setTimeMode' : (arg_0: { 'ic' : null } | { 'script' : number }) => Promise<
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
      'limit' : [] | [number],
      'videosPred' : VideosPred,
    }
  } |
  {
    'putRewardTransfer' : {
      'sender' : UserId_3,
      'amount' : number,
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
    'uploadReward' : { 'rewards' : number, 'videoId' : VideoId_2 }
  } |
  { 'superlikerReward' : { 'rewards' : number, 'videoId' : VideoId_2 } } |
  { 'transferReward' : { 'rewards' : number } };
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
export interface Event_2 { 'id' : number, 'kind' : EventKind, 'time' : number };
export interface Event_3 { 'check' : Check, 'isOk' : boolean, 'time' : number };
export interface GeoData {
  'latitude' : string,
  'altitude' : string,
  'longitudeSpan' : string,
  'latitudeSpan' : string,
  'longitude' : string,
};
export type Hash = number;
export interface Key { 'key' : UserId_2, 'hash' : Hash };
export interface Key_2 { 'key' : string, 'hash' : Hash };
export interface Key_3 { 'key' : ChunkId, 'hash' : Hash };
export interface Key_4 { 'key' : VideoId_2, 'hash' : Hash };
export interface Key_5 { 'key' : Principal, 'hash' : Hash };
export interface Leaf { 'size' : number, 'keyvals' : AssocList };
export interface Leaf_10 { 'size' : number, 'keyvals' : AssocList_19 };
export interface Leaf_11 { 'size' : number, 'keyvals' : AssocList_21 };
export interface Leaf_2 { 'size' : number, 'keyvals' : AssocList_3 };
export interface Leaf_3 { 'size' : number, 'keyvals' : AssocList_5 };
export interface Leaf_4 { 'size' : number, 'keyvals' : AssocList_7 };
export interface Leaf_5 { 'size' : number, 'keyvals' : AssocList_9 };
export interface Leaf_6 { 'size' : number, 'keyvals' : AssocList_11 };
export interface Leaf_7 { 'size' : number, 'keyvals' : AssocList_13 };
export interface Leaf_8 { 'size' : number, 'keyvals' : AssocList_15 };
export interface Leaf_9 { 'size' : number, 'keyvals' : AssocList_17 };
export interface LikeVideo {
  'source' : UserId_2,
  'likes' : boolean,
  'target' : VideoId_2,
};
export type List = [] | [[[Key, Trie_2], List]];
export type List_10 = [] | [[[Key_5, UserId_2], List_10]];
export type List_11 = [] | [[[Key_4, Video], List_11]];
export type List_2 = [] | [[[Key_2, null], List_2]];
export type List_3 = [] | [[[Key_3, ChunkData], List_3]];
export type List_4 = [] | [[[Key, Trie_5], List_4]];
export type List_5 = [] | [[[Key, null], List_5]];
export type List_6 = [] | [[[Key, Trie_7], List_6]];
export type List_7 = [] | [[[Key_4, null], List_7]];
export type List_8 = [] | [[[Key, Profile], List_8]];
export type List_9 = [] | [[[Key, number], List_9]];
export type MapShared = Trie_3;
export type MapShared_2 = Trie_8;
export type MapShared_3 = Trie_9;
export type MapShared_4 = Trie_10;
export type MapShared_5 = Trie_11;
export interface Message { 'id' : number, 'time' : Timestamp, 'event' : Event };
export type People = Array<Person>;
export interface Person { 'name' : string };
export interface Profile { 'userName' : string, 'createdAt' : Timestamp };
export type ProfileInfo = ProfileInfo_2;
export type ProfileInfoPlus = ProfileInfoPlus_2;
export interface ProfileInfoPlus_2 {
  'userName' : string,
  'uploadedVideos' : Array<VideoInfo_2>,
  'likedVideos' : Array<VideoInfo_2>,
  'rewards' : number,
  'allowances' : [] | [UserAllowances],
  'hasPic' : boolean,
  'followers' : Array<ProfileInfo_2>,
  'following' : Array<ProfileInfo_2>,
  'viewerHasFlagged' : [] | [boolean],
  'abuseFlagCount' : number,
};
export interface ProfileInfo_2 {
  'userName' : string,
  'uploadedVideos' : Array<VideoId_2>,
  'likedVideos' : Array<VideoId_2>,
  'rewards' : number,
  'hasPic' : boolean,
  'followers' : Array<UserId_2>,
  'following' : Array<UserId_2>,
  'abuseFlagCount' : number,
};
export type ProfilePic = ProfilePic_2;
export type ProfilePic_2 = Array<number>;
export type RelShared = RelShared_2;
export interface RelShared_2 { 'forw' : Trie2D };
export type RelShared_3 = RelShared_4;
export interface RelShared_4 { 'forw' : Trie2D_2 };
export type RelShared_5 = RelShared_6;
export interface RelShared_6 { 'forw' : Trie2D_3 };
export type Result = { 'ok' : null } |
  { 'err' : string };
export interface RewardPointTransfer {
  'sender' : UserId_2,
  'amount' : number,
  'receiver' : UserId_2,
};
export interface ShareVideo {
  'isShared' : boolean,
  'target' : VideoId_2,
  'receiver' : UserId_2,
};
export type Signal = { 'viralVideo' : ViralVideo };
export interface StateShared {
  'albums' : RelShared,
  'follows' : RelShared_3,
  'likes' : RelShared_5,
  'users' : MapShared_4,
  'rewards' : MapShared_3,
  'uploaded' : RelShared_5,
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
  { 'script' : number };
export type Timestamp = number;
export interface Trace {
  'status' : { 'ok' : null } |
    { 'err' : null },
  'trace' : Array<TraceCommand>,
};
export interface TraceCommand { 'result' : Result, 'command' : Command };
export type Trie = { 'branch' : Branch } |
  { 'leaf' : Leaf } |
  { 'empty' : null };
export type Trie2D = Trie;
export type Trie2D_2 = Trie_4;
export type Trie2D_3 = Trie_6;
export type Trie_10 = { 'branch' : Branch_10 } |
  { 'leaf' : Leaf_10 } |
  { 'empty' : null };
export type Trie_11 = { 'branch' : Branch_11 } |
  { 'leaf' : Leaf_11 } |
  { 'empty' : null };
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
export interface UploadOrigin {
  'url' : string,
  'localFolderName' : string,
  'deviceType' : string,
};
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
  'uploadedFrom' : [] | [UploadOrigin],
  'geoData' : [] | [GeoData],
  'people' : [] | [People],
  'externalId' : string,
  'userId' : UserId_2,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'geoDataExif' : [] | [GeoData],
  'viewCount' : number,
  'caption' : string,
  'lastModifiedAt' : [] | [Timestamp],
  'chunkCount' : number,
  'uploadedAt' : Timestamp,
};
export type VideoId = VideoId_2;
export type VideoId_2 = string;
export type VideoId_3 = VideoId_2;
export type VideoInfo = VideoInfo_2;
export interface VideoInfo_2 {
  'pic' : [] | [VideoPic_2],
  'viralAt' : [] | [Timestamp],
  'uploadedFrom' : [] | [UploadOrigin],
  'album' : [] | [Array<string>],
  'geoData' : [] | [GeoData],
  'people' : [] | [People],
  'externalId' : string,
  'userId' : UserId_2,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'likes' : Array<UserId_2>,
  'geoDataExif' : [] | [GeoData],
  'viewCount' : number,
  'caption' : string,
  'sharedCount' : number,
  'lastModifiedAt' : [] | [Timestamp],
  'chunkCount' : number,
  'superLikes' : Array<UserId_2>,
  'viewerHasFlagged' : [] | [boolean],
  'abuseFlagCount' : number,
  'uploadedAt' : Timestamp,
  'videoId' : VideoId_2,
};
export type VideoInit = VideoInit_2;
export interface VideoInit_2 {
  'uploadedFrom' : [] | [UploadOrigin],
  'album' : [] | [Array<string>],
  'geoData' : [] | [GeoData],
  'people' : [] | [People],
  'externalId' : string,
  'userId' : UserId_2,
  'name' : string,
  'createdAt' : Timestamp,
  'tags' : Array<string>,
  'geoDataExif' : [] | [GeoData],
  'caption' : string,
  'lastModifiedAt' : [] | [Timestamp],
  'chunkCount' : number,
};
export type VideoPic = VideoPic_2;
export type VideoPic_2 = Array<number>;
export type VideoResult = VideoResult_2;
export type VideoResult_2 = [VideoInfo_2, [] | [VideoPic_2]];
export type VideoResults = VideoResults_2;
export type VideoResults_2 = Array<VideoResult_2>;
export type VideosPred = { 'containsAll' : Array<VideoId_3> } |
  { 'equals' : Array<VideoId_3> };
export interface ViralVideo {
  'video' : VideoId_2,
  'superLikers' : Array<ViralVideoSuperLiker>,
  'uploader' : UserId_2,
};
export interface ViralVideoSuperLiker { 'time' : number, 'user' : UserId_2 };
export default CanCan;