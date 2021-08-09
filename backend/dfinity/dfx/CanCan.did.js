export default ({ IDL }) => {
  const List = IDL.Rec();
  const List_2 = IDL.Rec();
  const List_3 = IDL.Rec();
  const List_4 = IDL.Rec();
  const List_5 = IDL.Rec();
  const List_6 = IDL.Rec();
  const List_7 = IDL.Rec();
  const List_8 = IDL.Rec();
  const List_9 = IDL.Rec();
  const Trie = IDL.Rec();
  const Trie_2 = IDL.Rec();
  const Trie_3 = IDL.Rec();
  const Trie_4 = IDL.Rec();
  const Trie_5 = IDL.Rec();
  const Trie_6 = IDL.Rec();
  const Trie_7 = IDL.Rec();
  const Trie_8 = IDL.Rec();
  const Trie_9 = IDL.Rec();
  const ProfilePic_2 = IDL.Vec(IDL.Nat8);
  const ProfilePic = ProfilePic_2;
  const VideoPic_2 = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Int;
  const UserId_2 = IDL.Text;
  const VideoId_2 = IDL.Text;
  const VideoInfo_2 = IDL.Record({
    'pic' : IDL.Opt(VideoPic_2),
    'viralAt' : IDL.Opt(Timestamp),
    'externalId' : IDL.Text,
    'userId' : UserId_2,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'tags' : IDL.Vec(IDL.Text),
    'likes' : IDL.Vec(UserId_2),
    'viewCount' : IDL.Nat,
    'caption' : IDL.Text,
    'sharedCount' : IDL.Nat,
    'chunkCount' : IDL.Nat,
    'superLikes' : IDL.Vec(UserId_2),
    'viewerHasFlagged' : IDL.Opt(IDL.Bool),
    'abuseFlagCount' : IDL.Nat,
    'uploadedAt' : Timestamp,
    'videoId' : VideoId_2,
  });
  const AllowanceBalance = IDL.Variant({
    'zeroUntil' : Timestamp,
    'zeroForever' : IDL.Null,
    'nonZero' : IDL.Nat,
  });
  const UserAllowances = IDL.Record({
    'abuseFlags' : AllowanceBalance,
    'superLikes' : AllowanceBalance,
  });
  const ProfileInfo_2 = IDL.Record({
    'userName' : IDL.Text,
    'uploadedVideos' : IDL.Vec(VideoId_2),
    'likedVideos' : IDL.Vec(VideoId_2),
    'rewards' : IDL.Nat,
    'hasPic' : IDL.Bool,
    'followers' : IDL.Vec(UserId_2),
    'following' : IDL.Vec(UserId_2),
    'abuseFlagCount' : IDL.Nat,
  });
  const ProfileInfoPlus_2 = IDL.Record({
    'userName' : IDL.Text,
    'uploadedVideos' : IDL.Vec(VideoInfo_2),
    'likedVideos' : IDL.Vec(VideoInfo_2),
    'rewards' : IDL.Nat,
    'allowances' : IDL.Opt(UserAllowances),
    'hasPic' : IDL.Bool,
    'followers' : IDL.Vec(ProfileInfo_2),
    'following' : IDL.Vec(ProfileInfo_2),
    'viewerHasFlagged' : IDL.Opt(IDL.Bool),
    'abuseFlagCount' : IDL.Nat,
  });
  const ProfileInfoPlus = ProfileInfoPlus_2;
  const UserId = UserId_2;
  const VideoId = VideoId_2;
  const VideoInit_2 = IDL.Record({
    'externalId' : IDL.Text,
    'userId' : UserId_2,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'tags' : IDL.Vec(IDL.Text),
    'caption' : IDL.Text,
    'chunkCount' : IDL.Nat,
  });
  const VideoInit = VideoInit_2;
  const VideoId_3 = VideoId_2;
  const UserId_3 = UserId_2;
  const VideosPred = IDL.Variant({
    'containsAll' : IDL.Vec(VideoId_3),
    'equals' : IDL.Vec(VideoId_3),
  });
  const TimeMode = IDL.Variant({ 'ic' : IDL.Null, 'script' : IDL.Int });
  const Command = IDL.Variant({
    'assertVideoVirality' : IDL.Record({
      'isViral' : IDL.Bool,
      'videoId' : VideoId_3,
    }),
    'putProfileFollow' : IDL.Record({
      'toFollow' : UserId_3,
      'userId' : UserId_3,
      'follows' : IDL.Bool,
    }),
    'createTestData' : IDL.Record({
      'users' : IDL.Vec(UserId_3),
      'videos' : IDL.Vec(IDL.Tuple(UserId_3, VideoId_3)),
    }),
    'putSuperLike' : IDL.Record({
      'userId' : UserId_3,
      'superLikes' : IDL.Bool,
      'videoId' : VideoId_3,
    }),
    'assertVideoFeed' : IDL.Record({
      'userId' : UserId_3,
      'limit' : IDL.Opt(IDL.Nat),
      'videosPred' : VideosPred,
    }),
    'putRewardTransfer' : IDL.Record({
      'sender' : UserId_3,
      'amount' : IDL.Nat,
      'receiver' : UserId_3,
    }),
    'reset' : TimeMode,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const TraceCommand = IDL.Record({ 'result' : Result, 'command' : Command });
  const Trace = IDL.Record({
    'status' : IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Null }),
    'trace' : IDL.Vec(TraceCommand),
  });
  const UserAction = IDL.Variant({
    'admin' : IDL.Null,
    'view' : IDL.Null,
    'create' : IDL.Null,
    'update' : IDL.Null,
  });
  const ActionTarget = IDL.Variant({
    'all' : IDL.Null,
    'video' : VideoId_2,
    'user' : UserId_2,
    'pubView' : IDL.Null,
  });
  const Check = IDL.Record({
    'userAction' : UserAction,
    'caller' : IDL.Principal,
    'actionTarget' : ActionTarget,
  });
  const Event_3 = IDL.Record({
    'check' : Check,
    'isOk' : IDL.Bool,
    'time' : IDL.Int,
  });
  const VideoResult = IDL.Tuple(VideoInfo_2, IDL.Opt(VideoPic_2));
  const VideoResults_2 = IDL.Vec(VideoResult);
  const VideoResults = VideoResults_2;
  const LikeVideo = IDL.Record({
    'source' : UserId_2,
    'likes' : IDL.Bool,
    'target' : VideoId_2,
  });
  const AbuseFlag = IDL.Record({
    'flag' : IDL.Bool,
    'target' : IDL.Variant({ 'video' : VideoId_2, 'user' : UserId_2 }),
    'reporter' : UserId_2,
  });
  const SuperLikeVideoFail = IDL.Record({
    'source' : UserId_2,
    'target' : VideoId_2,
  });
  const SuperLikeVideo = IDL.Record({
    'source' : UserId_2,
    'target' : VideoId_2,
    'superLikes' : IDL.Bool,
  });
  const RewardPointTransfer = IDL.Record({
    'sender' : UserId_2,
    'amount' : IDL.Nat,
    'receiver' : UserId_2,
  });
  const CreateVideo = IDL.Record({ 'info' : VideoInit_2 });
  const ShareVideo = IDL.Record({
    'isShared' : IDL.Bool,
    'target' : VideoId_2,
    'receiver' : UserId_2,
  });
  const CreateProfile = IDL.Record({
    'pic' : IDL.Opt(ProfilePic_2),
    'userName' : IDL.Text,
  });
  const ViralVideoSuperLiker = IDL.Record({
    'time' : IDL.Int,
    'user' : UserId_2,
  });
  const ViralVideo = IDL.Record({
    'video' : VideoId_2,
    'superLikers' : IDL.Vec(ViralVideoSuperLiker),
    'uploader' : UserId_2,
  });
  const Signal = IDL.Variant({ 'viralVideo' : ViralVideo });
  const EventKind = IDL.Variant({
    'likeVideo' : LikeVideo,
    'abuseFlag' : AbuseFlag,
    'superLikeVideoFail' : SuperLikeVideoFail,
    'superLikeVideo' : SuperLikeVideo,
    'rewardPointTransfer' : RewardPointTransfer,
    'createVideo' : CreateVideo,
    'shareVideo' : ShareVideo,
    'createProfile' : CreateProfile,
    'emitSignal' : Signal,
    'reset' : TimeMode,
  });
  const Event_2 = IDL.Record({
    'id' : IDL.Nat,
    'kind' : EventKind,
    'time' : IDL.Int,
  });
  const Event = IDL.Variant({
    'uploadReward' : IDL.Record({ 'rewards' : IDL.Nat, 'videoId' : VideoId_2 }),
    'superlikerReward' : IDL.Record({
      'rewards' : IDL.Nat,
      'videoId' : VideoId_2,
    }),
    'transferReward' : IDL.Record({ 'rewards' : IDL.Nat }),
  });
  const Message = IDL.Record({
    'id' : IDL.Nat,
    'time' : Timestamp,
    'event' : Event,
  });
  const ProfileInfo = ProfileInfo_2;
  const Branch_2 = IDL.Record({
    'left' : Trie_2,
    'size' : IDL.Nat,
    'right' : Trie_2,
  });
  const Hash = IDL.Nat32;
  const Key_2 = IDL.Record({ 'key' : UserId_2, 'hash' : Hash });
  const Branch_3 = IDL.Record({
    'left' : Trie_3,
    'size' : IDL.Nat,
    'right' : Trie_3,
  });
  List_3.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_2, IDL.Null), List_3)));
  const AssocList_6 = List_3;
  const AssocList_5 = AssocList_6;
  const Leaf_3 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_5 });
  Trie_3.fill(
    IDL.Variant({ 'branch' : Branch_3, 'leaf' : Leaf_3, 'empty' : IDL.Null })
  );
  List_2.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_2, Trie_3), List_2)));
  const AssocList_4 = List_2;
  const AssocList_3 = AssocList_4;
  const Leaf_2 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_3 });
  Trie_2.fill(
    IDL.Variant({ 'branch' : Branch_2, 'leaf' : Leaf_2, 'empty' : IDL.Null })
  );
  const Trie2D = Trie_2;
  const RelShared_2 = IDL.Record({ 'forw' : Trie2D });
  const RelShared = RelShared_2;
  const Branch_4 = IDL.Record({
    'left' : Trie_4,
    'size' : IDL.Nat,
    'right' : Trie_4,
  });
  const Branch_5 = IDL.Record({
    'left' : Trie_5,
    'size' : IDL.Nat,
    'right' : Trie_5,
  });
  const Key_3 = IDL.Record({ 'key' : VideoId_2, 'hash' : Hash });
  List_5.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_3, IDL.Null), List_5)));
  const AssocList_10 = List_5;
  const AssocList_9 = AssocList_10;
  const Leaf_5 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_9 });
  Trie_5.fill(
    IDL.Variant({ 'branch' : Branch_5, 'leaf' : Leaf_5, 'empty' : IDL.Null })
  );
  List_4.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_2, Trie_5), List_4)));
  const AssocList_8 = List_4;
  const AssocList_7 = AssocList_8;
  const Leaf_4 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_7 });
  Trie_4.fill(
    IDL.Variant({ 'branch' : Branch_4, 'leaf' : Leaf_4, 'empty' : IDL.Null })
  );
  const Trie2D_2 = Trie_4;
  const RelShared_4 = IDL.Record({ 'forw' : Trie2D_2 });
  const RelShared_3 = RelShared_4;
  const Branch_8 = IDL.Record({
    'left' : Trie_8,
    'size' : IDL.Nat,
    'right' : Trie_8,
  });
  const Key_4 = IDL.Record({ 'key' : IDL.Principal, 'hash' : Hash });
  List_8.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_4, UserId_2), List_8)));
  const AssocList_16 = List_8;
  const AssocList_15 = AssocList_16;
  const Leaf_8 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_15 });
  Trie_8.fill(
    IDL.Variant({ 'branch' : Branch_8, 'leaf' : Leaf_8, 'empty' : IDL.Null })
  );
  const MapShared_4 = Trie_8;
  const Branch_7 = IDL.Record({
    'left' : Trie_7,
    'size' : IDL.Nat,
    'right' : Trie_7,
  });
  List_7.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_2, IDL.Nat), List_7)));
  const AssocList_14 = List_7;
  const AssocList_13 = AssocList_14;
  const Leaf_7 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_13 });
  Trie_7.fill(
    IDL.Variant({ 'branch' : Branch_7, 'leaf' : Leaf_7, 'empty' : IDL.Null })
  );
  const MapShared_3 = Trie_7;
  const Branch = IDL.Record({
    'left' : Trie,
    'size' : IDL.Nat,
    'right' : Trie,
  });
  const ChunkId = IDL.Text;
  const Key = IDL.Record({ 'key' : ChunkId, 'hash' : Hash });
  const ChunkData_2 = IDL.Vec(IDL.Nat8);
  const ChunkData = ChunkData_2;
  List.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key, ChunkData), List)));
  const AssocList_2 = List;
  const AssocList = AssocList_2;
  const Leaf = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList });
  Trie.fill(
    IDL.Variant({ 'branch' : Branch, 'leaf' : Leaf, 'empty' : IDL.Null })
  );
  const MapShared = Trie;
  const Branch_9 = IDL.Record({
    'left' : Trie_9,
    'size' : IDL.Nat,
    'right' : Trie_9,
  });
  const Video = IDL.Record({
    'viralAt' : IDL.Opt(Timestamp),
    'externalId' : IDL.Text,
    'userId' : UserId_2,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'tags' : IDL.Vec(IDL.Text),
    'viewCount' : IDL.Nat,
    'caption' : IDL.Text,
    'chunkCount' : IDL.Nat,
    'uploadedAt' : Timestamp,
  });
  List_9.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_3, Video), List_9)));
  const AssocList_18 = List_9;
  const AssocList_17 = AssocList_18;
  const Leaf_9 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_17 });
  Trie_9.fill(
    IDL.Variant({ 'branch' : Branch_9, 'leaf' : Leaf_9, 'empty' : IDL.Null })
  );
  const MapShared_5 = Trie_9;
  const Branch_6 = IDL.Record({
    'left' : Trie_6,
    'size' : IDL.Nat,
    'right' : Trie_6,
  });
  const Profile = IDL.Record({
    'userName' : IDL.Text,
    'createdAt' : Timestamp,
  });
  List_6.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(Key_2, Profile), List_6)));
  const AssocList_12 = List_6;
  const AssocList_11 = AssocList_12;
  const Leaf_6 = IDL.Record({ 'size' : IDL.Nat, 'keyvals' : AssocList_11 });
  Trie_6.fill(
    IDL.Variant({ 'branch' : Branch_6, 'leaf' : Leaf_6, 'empty' : IDL.Null })
  );
  const MapShared_2 = Trie_6;
  const StateShared = IDL.Record({
    'follows' : RelShared,
    'likes' : RelShared_3,
    'users' : MapShared_4,
    'rewards' : MapShared_3,
    'uploaded' : RelShared_3,
    'chunks' : MapShared,
    'videos' : MapShared_5,
    'profiles' : MapShared_2,
  });
  const VideoInfo = VideoInfo_2;
  const VideoPic = VideoPic_2;
  const CanCan = IDL.Service({
    'checkUsernameAvailable' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'createProfile' : IDL.Func(
        [IDL.Text, IDL.Opt(ProfilePic)],
        [IDL.Opt(ProfileInfoPlus)],
        [],
      ),
    'createTestData' : IDL.Func(
        [IDL.Vec(UserId), IDL.Vec(IDL.Tuple(UserId, VideoId))],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'createVideo' : IDL.Func([VideoInit], [IDL.Opt(VideoId)], []),
    'doDemo' : IDL.Func([IDL.Vec(Command)], [IDL.Opt(Trace)], []),
    'getAccessLog' : IDL.Func([], [IDL.Opt(IDL.Vec(Event_3))], ['query']),
    'getAllUserVideos' : IDL.Func(
        [UserId, IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getEventLog' : IDL.Func([], [IDL.Opt(IDL.Vec(Event_2))], ['query']),
    'getFeedVideos' : IDL.Func(
        [UserId, IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getIsSuperLiker' : IDL.Func(
        [UserId, VideoId],
        [IDL.Opt(IDL.Bool)],
        ['query'],
      ),
    'getMessages' : IDL.Func([UserId], [IDL.Opt(IDL.Vec(Message))], ['query']),
    'getProfileInfo' : IDL.Func([UserId], [IDL.Opt(ProfileInfo)], ['query']),
    'getProfilePic' : IDL.Func([UserId], [IDL.Opt(ProfilePic)], ['query']),
    'getProfilePlus' : IDL.Func(
        [IDL.Opt(UserId), UserId],
        [IDL.Opt(ProfileInfoPlus)],
        ['query'],
      ),
    'getProfileVideos' : IDL.Func(
        [UserId, IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getProfiles' : IDL.Func([], [IDL.Opt(IDL.Vec(ProfileInfo))], ['query']),
    'getSearchVideos' : IDL.Func(
        [UserId, IDL.Vec(IDL.Text), IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getState' : IDL.Func([], [StateShared], ['query']),
    'getSuperLikeValidNow' : IDL.Func(
        [UserId, VideoId],
        [IDL.Opt(IDL.Bool)],
        ['query'],
      ),
    'getUserNameByPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(IDL.Text))],
        [],
      ),
    'getVideoChunk' : IDL.Func(
        [VideoId, IDL.Nat],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'getVideoInfo' : IDL.Func(
        [IDL.Opt(UserId), VideoId],
        [IDL.Opt(VideoInfo)],
        ['query'],
      ),
    'getVideoPic' : IDL.Func([VideoId], [IDL.Opt(VideoPic)], ['query']),
    'getVideos' : IDL.Func([], [IDL.Opt(IDL.Vec(VideoInfo))], ['query']),
    'isDropDay' : IDL.Func([], [IDL.Opt(IDL.Bool)], ['query']),
    'putAbuseFlagUser' : IDL.Func(
        [UserId, UserId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putAbuseFlagVideo' : IDL.Func(
        [UserId, VideoId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putProfileFollow' : IDL.Func(
        [UserId, UserId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putProfilePic' : IDL.Func(
        [UserId, IDL.Opt(ProfilePic)],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putProfileVideoLike' : IDL.Func(
        [UserId, VideoId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putRewardTransfer' : IDL.Func(
        [UserId, UserId, IDL.Nat],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putRewards' : IDL.Func([UserId, IDL.Nat], [IDL.Opt(IDL.Null)], []),
    'putSuperLike' : IDL.Func(
        [UserId, VideoId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putTestFollows' : IDL.Func(
        [IDL.Vec(IDL.Tuple(UserId, UserId))],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putVideoChunk' : IDL.Func(
        [VideoId, IDL.Nat, IDL.Vec(IDL.Nat8)],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putVideoInfo' : IDL.Func([VideoId, VideoInit], [IDL.Opt(IDL.Null)], []),
    'putVideoPic' : IDL.Func(
        [VideoId, IDL.Opt(VideoPic)],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'reset' : IDL.Func(
        [IDL.Variant({ 'ic' : IDL.Null, 'script' : IDL.Int })],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'scriptTimeTick' : IDL.Func([], [IDL.Opt(IDL.Null)], []),
    'setTimeMode' : IDL.Func(
        [IDL.Variant({ 'ic' : IDL.Null, 'script' : IDL.Int })],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'shareVideo' : IDL.Func(
        [UserId, IDL.Text, IDL.Bool],
        [IDL.Opt(IDL.Text)],
        [],
      ),
    'testGetUserNameByPrincipal' : IDL.Func([IDL.Opt(IDL.Principal)], [], []),
  });
  return CanCan;
};
export const init = ({ IDL }) => { return []; };