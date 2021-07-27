export default ({ IDL }) => {
  const ProfilePic_2 = IDL.Vec(IDL.Nat8);
  const ProfilePic = ProfilePic_2;
  const VideoPic_2 = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Int;
  const UserId = IDL.Text;
  const VideoId_2 = IDL.Text;
  const VideoInfo_2 = IDL.Record({
    'pic' : IDL.Opt(VideoPic_2),
    'viralAt' : IDL.Opt(Timestamp),
    'userId' : UserId,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'tags' : IDL.Vec(IDL.Text),
    'likes' : IDL.Vec(UserId),
    'viewCount' : IDL.Nat,
    'caption' : IDL.Text,
    'chunkCount' : IDL.Nat,
    'superLikes' : IDL.Vec(UserId),
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
    'followers' : IDL.Vec(UserId),
    'following' : IDL.Vec(UserId),
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
  const UserId_2 = UserId;
  const VideoId = VideoId_2;
  const VideoInit_2 = IDL.Record({
    'userId' : UserId,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'tags' : IDL.Vec(IDL.Text),
    'caption' : IDL.Text,
    'chunkCount' : IDL.Nat,
  });
  const VideoInit = VideoInit_2;
  const VideoId_3 = VideoId_2;
  const UserId_3 = UserId;
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
    'user' : UserId,
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
  const LikeVideo = IDL.Record({
    'source' : UserId,
    'likes' : IDL.Bool,
    'target' : VideoId_2,
  });
  const AbuseFlag = IDL.Record({
    'flag' : IDL.Bool,
    'target' : IDL.Variant({ 'video' : VideoId_2, 'user' : UserId }),
    'reporter' : UserId,
  });
  const SuperLikeVideoFail = IDL.Record({
    'source' : UserId,
    'target' : VideoId_2,
  });
  const SuperLikeVideo = IDL.Record({
    'source' : UserId,
    'target' : VideoId_2,
    'superLikes' : IDL.Bool,
  });
  const RewardPointTransfer = IDL.Record({
    'sender' : UserId,
    'amount' : IDL.Nat,
    'receiver' : UserId,
  });
  const CreateVideo = IDL.Record({ 'info' : VideoInit_2 });
  const CreateProfile = IDL.Record({
    'pic' : IDL.Opt(ProfilePic_2),
    'userName' : IDL.Text,
  });
  const ViralVideoSuperLiker = IDL.Record({
    'time' : IDL.Int,
    'user' : UserId,
  });
  const ViralVideo = IDL.Record({
    'video' : VideoId_2,
    'superLikers' : IDL.Vec(ViralVideoSuperLiker),
    'uploader' : UserId,
  });
  const Signal = IDL.Variant({ 'viralVideo' : ViralVideo });
  const EventKind = IDL.Variant({
    'likeVideo' : LikeVideo,
    'abuseFlag' : AbuseFlag,
    'superLikeVideoFail' : SuperLikeVideoFail,
    'superLikeVideo' : SuperLikeVideo,
    'rewardPointTransfer' : RewardPointTransfer,
    'createVideo' : CreateVideo,
    'createProfile' : CreateProfile,
    'emitSignal' : Signal,
    'reset' : TimeMode,
  });
  const Event_2 = IDL.Record({
    'id' : IDL.Nat,
    'kind' : EventKind,
    'time' : IDL.Int,
  });
  const VideoResult = IDL.Tuple(VideoInfo_2, IDL.Opt(VideoPic_2));
  const VideoResults_2 = IDL.Vec(VideoResult);
  const VideoResults = VideoResults_2;
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
        [IDL.Vec(UserId_2), IDL.Vec(IDL.Tuple(UserId_2, VideoId))],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'createVideo' : IDL.Func([VideoInit], [IDL.Opt(VideoId)], []),
    'doDemo' : IDL.Func([IDL.Vec(Command)], [IDL.Opt(Trace)], []),
    'getAccessLog' : IDL.Func([], [IDL.Opt(IDL.Vec(Event_3))], ['query']),
    'getEventLog' : IDL.Func([], [IDL.Opt(IDL.Vec(Event_2))], ['query']),
    'getFeedVideos' : IDL.Func(
        [UserId_2, IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getIsSuperLiker' : IDL.Func(
        [UserId_2, VideoId],
        [IDL.Opt(IDL.Bool)],
        ['query'],
      ),
    'getMessages' : IDL.Func(
        [UserId_2],
        [IDL.Opt(IDL.Vec(Message))],
        ['query'],
      ),
    'getProfileInfo' : IDL.Func([UserId_2], [IDL.Opt(ProfileInfo)], ['query']),
    'getProfilePic' : IDL.Func([UserId_2], [IDL.Opt(ProfilePic)], ['query']),
    'getProfilePlus' : IDL.Func(
        [IDL.Opt(UserId_2), UserId_2],
        [IDL.Opt(ProfileInfoPlus)],
        ['query'],
      ),
    'getProfileVideos' : IDL.Func(
        [UserId_2, IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getProfiles' : IDL.Func([], [IDL.Opt(IDL.Vec(ProfileInfo))], ['query']),
    'getSearchVideos' : IDL.Func(
        [UserId_2, IDL.Vec(IDL.Text), IDL.Opt(IDL.Nat)],
        [IDL.Opt(VideoResults)],
        ['query'],
      ),
    'getSuperLikeValidNow' : IDL.Func(
        [UserId_2, VideoId],
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
        [IDL.Opt(UserId_2), VideoId],
        [IDL.Opt(VideoInfo)],
        ['query'],
      ),
    'getVideoPic' : IDL.Func([VideoId], [IDL.Opt(VideoPic)], ['query']),
    'getVideos' : IDL.Func([], [IDL.Opt(IDL.Vec(VideoInfo))], ['query']),
    'isDropDay' : IDL.Func([], [IDL.Opt(IDL.Bool)], ['query']),
    'putAbuseFlagUser' : IDL.Func(
        [UserId_2, UserId_2, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putAbuseFlagVideo' : IDL.Func(
        [UserId_2, VideoId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putProfileFollow' : IDL.Func(
        [UserId_2, UserId_2, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putProfilePic' : IDL.Func(
        [UserId_2, IDL.Opt(ProfilePic)],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putProfileVideoLike' : IDL.Func(
        [UserId_2, VideoId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putRewardTransfer' : IDL.Func(
        [UserId_2, UserId_2, IDL.Nat],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putRewards' : IDL.Func([UserId_2, IDL.Nat], [IDL.Opt(IDL.Null)], []),
    'putSuperLike' : IDL.Func(
        [UserId_2, VideoId, IDL.Bool],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putTestFollows' : IDL.Func(
        [IDL.Vec(IDL.Tuple(UserId_2, UserId_2))],
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
  });
  return CanCan;
};
export const init = ({ IDL }) => { return []; };